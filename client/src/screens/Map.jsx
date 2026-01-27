import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import { useAppContext } from '../hooks/AppContext';
import { usePathTracker } from '../hooks/usePathTracker';
import { MapPin, Navigation, Trash2, Clock } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom red marker for current location
const currentLocationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to recenter map when location changes
const MapRecenter = ({ lat, lng }) => {
    const map = useMap();

    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], map.getZoom());
        }
    }, [lat, lng, map]);

    return null;
};

const Map = () => {
    const { userLocation } = useAppContext();
    const { pathCoordinates, clearPath, pointCount, pathHistory } = usePathTracker(userLocation);
    const [showPathDetails, setShowPathDetails] = useState(false);

    // Default to Bangalore if no location
    const defaultLocation = { lat: 12.9716, lng: 77.5946 };
    const location = userLocation || defaultLocation;

    return (
        <div className="h-screen w-full relative">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-[1000] p-4 pointer-events-none">
                <div className="glass p-4 rounded-2xl pointer-events-auto max-w-md mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-black text-white italic uppercase flex items-center gap-2">
                                <MapPin className="text-red-500" size={20} />
                                Live <span className="text-red-500">Tracker</span>
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                Real-time GPS Monitoring
                            </p>
                        </div>
                        <button
                            onClick={clearPath}
                            className="p-2 bg-red-500/20 rounded-xl text-red-500 hover:bg-red-500/30 transition-colors"
                            title="Clear path history"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <MapContainer
                center={[location.lat, location.lng]}
                zoom={16}
                className="h-full w-full"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Auto-recenter when location changes */}
                {userLocation && <MapRecenter lat={userLocation.lat} lng={userLocation.lng} />}

                {/* Path Polyline */}
                {pathCoordinates.length > 1 && (
                    <Polyline
                        positions={pathCoordinates}
                        pathOptions={{
                            color: '#ef4444',
                            weight: 4,
                            opacity: 0.8,
                            dashArray: '10, 10'
                        }}
                    />
                )}

                {/* Accuracy Circle */}
                {userLocation?.accuracy && (
                    <Circle
                        center={[location.lat, location.lng]}
                        radius={userLocation.accuracy}
                        pathOptions={{
                            color: '#ef4444',
                            fillColor: '#ef4444',
                            fillOpacity: 0.1,
                            weight: 1
                        }}
                    />
                )}

                {/* Current Location Marker */}
                <Marker position={[location.lat, location.lng]} icon={currentLocationIcon}>
                    <Popup>
                        <div className="text-center">
                            <p className="font-bold text-red-600">Your Location</p>
                            <p className="text-xs text-gray-600 font-mono">
                                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                            </p>
                            {userLocation?.accuracy && (
                                <p className="text-xs text-gray-500">±{userLocation.accuracy.toFixed(0)}m accuracy</p>
                            )}
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>

            {/* Bottom Info Panel */}
            <div className="absolute bottom-20 left-0 right-0 z-[1000] p-4 pointer-events-none">
                <div className="glass p-4 rounded-2xl pointer-events-auto max-w-md mx-auto">
                    {/* Coordinates Display */}
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-2 bg-red-500/20 rounded-xl">
                            <Navigation className="text-red-500" size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Coordinates</p>
                            <p className="text-white font-mono text-sm">
                                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                            </p>
                        </div>
                    </div>

                    {/* Path Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-slate-400" />
                            <span className="text-xs text-slate-400">
                                <span className="text-white font-bold">{pointCount}</span> path points recorded
                            </span>
                        </div>
                        <button
                            onClick={() => setShowPathDetails(!showPathDetails)}
                            className="text-[10px] text-red-500 font-bold uppercase hover:underline"
                        >
                            {showPathDetails ? 'Hide' : 'Show'} History
                        </button>
                    </div>

                    {/* Path History Details */}
                    {showPathDetails && pathHistory.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10 max-h-32 overflow-y-auto">
                            {pathHistory.slice(-5).reverse().map((point, idx) => (
                                <div key={idx} className="flex justify-between text-[10px] py-1">
                                    <span className="text-slate-400 font-mono">
                                        {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                                    </span>
                                    <span className="text-slate-500">
                                        {new Date(point.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Map;
