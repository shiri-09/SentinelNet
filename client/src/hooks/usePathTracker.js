import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'sentinelnet_path_history';
const MAX_PATH_POINTS = 500; // Limit stored points to save memory

/**
 * Custom hook for tracking and storing location path
 * 
 * Features:
 * - Records location history with timestamps
 * - Persists path to localStorage
 * - Provides path history for map display
 */
export const usePathTracker = (currentLocation) => {
    const [pathHistory, setPathHistory] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load path history from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setPathHistory(parsed.slice(-MAX_PATH_POINTS));
                }
            }
        } catch (e) {
            console.error('[usePathTracker] Failed to load path:', e);
        }
        setIsLoaded(true);
    }, []);

    // Add new location to path when location changes
    useEffect(() => {
        if (!isLoaded || !currentLocation?.lat || !currentLocation?.lng) return;

        const lastPoint = pathHistory[pathHistory.length - 1];

        // Only add if location has changed significantly (>10 meters)
        if (lastPoint) {
            const distance = calculateDistance(
                lastPoint.lat, lastPoint.lng,
                currentLocation.lat, currentLocation.lng
            );
            if (distance < 10) return; // Skip if moved less than 10 meters
        }

        const newPoint = {
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            accuracy: currentLocation.accuracy,
            timestamp: Date.now()
        };

        setPathHistory(prev => {
            const updated = [...prev, newPoint].slice(-MAX_PATH_POINTS);

            // Save to localStorage
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {
                console.error('[usePathTracker] Failed to save path:', e);
            }

            return updated;
        });

        console.log(`[usePathTracker] Path updated: ${pathHistory.length + 1} points`);
    }, [currentLocation?.lat, currentLocation?.lng, isLoaded]);

    /**
     * Clear all path history
     */
    const clearPath = useCallback(() => {
        setPathHistory([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error('[usePathTracker] Failed to clear path:', e);
        }
        console.log('[usePathTracker] Path cleared');
    }, []);

    /**
     * Get path as array of [lat, lng] for Leaflet polyline
     */
    const getPathCoordinates = useCallback(() => {
        return pathHistory.map(point => [point.lat, point.lng]);
    }, [pathHistory]);

    return {
        pathHistory,
        pathCoordinates: getPathCoordinates(),
        clearPath,
        pointCount: pathHistory.length
    };
};

/**
 * Calculate distance between two points in meters (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

export default usePathTracker;
