import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import { processAlert } from '../logic/alertDecisionEngine';
import { stopSeverityResponse } from '../logic/severityController';
import { executeSOSFlow, stopSOSFlow, recoverSOSState, SOS_STATES } from '../logic/sosEngine';
import { startTracking, stopTracking, getTrackingStatus } from '../logic/gpsController';
import { useBattery } from './useBattery';
import { useContacts } from './useContacts';
import axios from 'axios';

const AppContext = createContext();

/**
 * Notify all emergency contacts with user's location
 * Called when HIGH or MEDIUM severity alerts are triggered
 */
const notifyContacts = async (contacts, location, alert) => {
    if (!contacts || contacts.length === 0) {
        console.log('[Contacts] No contacts to notify');
        return;
    }

    console.log(`[Contacts] Notifying ${contacts.length} contacts about ${alert.severity} alert`);

    try {
        await axios.post('/api/contacts/notify', {
            contacts,
            location,
            alert: {
                id: alert.id,
                type: alert.type,
                severity: alert.severity,
                timestamp: alert.timestamp
            }
        });
        console.log('[Contacts] Notification sent successfully');
    } catch (e) {
        console.error('[Contacts] Failed to notify contacts:', e.message);
    }
};

/**
 * Trigger automatic emergency call based on alert type
 * Maps disaster types to appropriate emergency services
 */
const triggerEmergencyCall = (alertType) => {
    const emergencyNumbers = {
        'Fire': { number: '101', service: 'Fire Department' },
        'Flood': { number: '112', service: 'Police/Emergency' },
        'Earthquake': { number: '112', service: 'Police/Emergency' },
        'Toxic Gas Leak': { number: '108', service: 'Ambulance' }
    };

    const emergency = emergencyNumbers[alertType] || emergencyNumbers['Flood'];

    console.log(`[AutoCall] Initiating call to ${emergency.service} (${emergency.number}) for ${alertType} alert`);

    // Create a temporary anchor element to trigger the call
    // This avoids navigation issues with window.location.href
    const link = document.createElement('a');
    link.href = `tel:${emergency.number}`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return emergency;
};

/**
 * Main Application Provider
 * 
 * This is the Control Plane integration point where all modules converge.
 * Implements graceful degradation and failure-tolerant state management.
 */
export const AppProvider = ({ children }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [isSOSActive, setIsSOSActive] = useState(false);
    const [sosPhase, setSOSPhase] = useState(SOS_STATES.IDLE);
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [logs, setLogs] = useState({ sos: [], services: [], decisions: [] });
    const [socket, setSocket] = useState(null);
    const [isLowPowerMode, setIsLowPowerMode] = useState(false);

    const battery = useBattery();
    const { contacts, addContact, removeContact, canAddMore, maxContacts } = useContacts();

    // Ref to track current location for socket event handlers (avoids stale closure)
    const userLocationRef = useRef(userLocation);
    useEffect(() => {
        userLocationRef.current = userLocation;
    }, [userLocation]);

    // Low Power Mode detection
    useEffect(() => {
        setIsLowPowerMode(battery.isLow);
    }, [battery.isLow]);

    // Crash Recovery: Check for persisted SOS state on mount
    useEffect(() => {
        const recovered = recoverSOSState();
        if (recovered && recovered.phase !== SOS_STATES.IDLE) {
            console.log('[AppContext] Recovered SOS state from crash:', recovered);
            setIsSOSActive(true);
            setSOSPhase(recovered.phase);
            if (recovered.location) {
                setUserLocation(recovered.location);
            }
        }
    }, []);

    // Initialize Socket.io with connection resilience
    useEffect(() => {
        const newSocket = io('/', {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        setSocket(newSocket);

        newSocket.on('new_alert', (alert) => {
            // Use ref to get current location (avoids stale closure)
            const currentLocation = userLocationRef.current;

            // Use the explicit Alert Decision Engine
            const decision = processAlert(currentLocation, alert);

            // Log decision for audit trail
            setLogs(prev => ({
                ...prev,
                decisions: [...prev.decisions.slice(-50), decision] // Keep last 50
            }));

            if (decision.shouldTrigger) {
                setActiveAlerts(prev => [...prev, alert]);

                // Notify emergency contacts for HIGH and MEDIUM severity alerts
                if (alert.severity === 'HIGH' || alert.severity === 'MEDIUM') {
                    // Get contacts from localStorage directly to avoid closure issues
                    const storedContacts = JSON.parse(localStorage.getItem('sentinelnet_emergency_contacts') || '[]');
                    if (storedContacts.length > 0) {
                        notifyContacts(storedContacts, currentLocation, alert);
                    }

                    // Auto-call emergency services for HIGH severity alerts
                    if (alert.severity === 'HIGH') {
                        // Small delay to ensure alert is displayed first
                        setTimeout(() => {
                            triggerEmergencyCall(alert.type);
                        }, 2000);
                    }
                }
            }
        });

        newSocket.on('connect_error', (err) => {
            console.warn('[AppContext] Socket connection error:', err.message);
        });

        return () => newSocket.close();
    }, []); // Empty dependency - socket connects once on mount

    // Adaptive GPS Tracking
    useEffect(() => {
        const context = {
            isSOSActive,
            batteryLevel: battery.level,
            isLowPowerMode
        };

        startTracking(
            (location) => {
                setUserLocation(location);

                // If SOS is active, log location updates to server
                if (isSOSActive) {
                    axios.post('/api/sos/start', {
                        userId: 'demo-user',
                        location,
                        phase: sosPhase
                    }).catch(console.error);
                }
            },
            (error) => console.error('[AppContext] GPS Error:', error),
            context
        );

        return () => stopTracking();
    }, [isSOSActive, battery.level, isLowPowerMode, sosPhase]);

    /**
     * Transactional SOS Toggle
     * Implements exactly-once semantics with failure tolerance.
     */
    const toggleSOS = useCallback(async () => {
        const newState = !isSOSActive;
        setIsSOSActive(newState);

        if (newState) {
            // Execute transactional SOS flow
            await executeSOSFlow({
                onStateChange: (state) => {
                    setSOSPhase(state.phase);
                    setLogs(prev => ({
                        ...prev,
                        sos: [...prev.sos, { ...state, timestamp: Date.now() }]
                    }));
                },
                onError: (error) => {
                    console.error('[AppContext] SOS Error:', error);
                },
                onComplete: async (state) => {
                    // Notify server of SOS activation
                    try {
                        await axios.post('/api/sos/start', {
                            userId: 'demo-user',
                            location: state.location,
                            phase: state.phase
                        });
                    } catch (e) {
                        console.error('[AppContext] Server notification failed:', e);
                    }
                }
            });
        } else {
            // Stop SOS flow
            const stoppedState = stopSOSFlow();
            setSOSPhase(stoppedState.phase);
            stopSeverityResponse();

            try {
                await axios.post('/api/sos/stop', { userId: 'demo-user' });
            } catch (e) {
                console.error('[AppContext] Server stop notification failed:', e);
            }
        }
    }, [isSOSActive]);

    /**
     * Emergency Service Request
     * User-initiated only (ethical constraint).
     */
    const requestService = useCallback(async (service) => {
        const request = {
            service,
            location: userLocation,
            userId: 'demo-user',
            timestamp: Date.now()
        };

        try {
            const res = await axios.post('/api/service/request', request);
            setLogs(prev => ({
                ...prev,
                services: [...prev.services, { ...request, response: res.data }]
            }));
        } catch (e) {
            // Log locally even if server fails
            setLogs(prev => ({
                ...prev,
                services: [...prev.services, { ...request, error: e.message }]
            }));
        }
    }, [userLocation]);

    /**
     * Dismiss Alert
     * Stops severity responses when no active alerts remain.
     */
    const dismissAlert = useCallback((id) => {
        setActiveAlerts(prev => {
            const remaining = prev.filter(a => a.id !== id);
            if (remaining.length === 0) {
                stopSeverityResponse();
            }
            return remaining;
        });
    }, []);

    return (
        <AppContext.Provider value={{
            // State
            userLocation,
            isSOSActive,
            sosPhase,
            activeAlerts,
            logs,
            isLowPowerMode,
            battery,

            // Contacts
            contacts,
            addContact,
            removeContact,
            canAddMore,
            maxContacts,

            // Actions
            toggleSOS,
            dismissAlert,
            requestService,

            // Tracking status
            trackingStatus: getTrackingStatus()
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
