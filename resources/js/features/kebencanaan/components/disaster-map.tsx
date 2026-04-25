import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface DisasterPoint {
    id: string;
    title: string;
    lat: number;
    lng: number;
    location: string;
    time: string;
    description: string;
    status: string;
}

interface DisasterMapProps {
    points: DisasterPoint[];
}

const ChangeView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    map.setView(center, 13);
    return null;
};

const DisasterMap: React.FC<DisasterMapProps> = ({ points }) => {
    // Center of Padang City
    const padangCenter: [number, number] = [-0.947, 100.417];

    return (
        <div className="w-full h-[500px] rounded-xl overflow-hidden border border-teal-500/20 shadow-lg relative z-0">
            <MapContainer
                center={padangCenter}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {points?.filter(p => p.lat && p.lng).map((point) => (
                    <Marker
                        key={point.id}
                        position={[point.lat, point.lng]}
                    >
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-teal-800">{point.title}</h3>
                                <p className="text-sm font-semibold">{point.location}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    {point.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Waktu: {point.time}
                                </p>
                                <div className="mt-2">
                                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-[10px] font-bold uppercase">
                                        {point.status}
                                    </span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Fallback to center if no points, but usually we want to stay in Padang */}
            </MapContainer>
        </div>
    );
};

export default DisasterMap;
