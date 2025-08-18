// src/pages/ManagerTrackOrderPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { getManagerTrackingInfo } from '@/services/api';
import { ArrowLeft, Clock, User, Phone, Bike, Home, Store, CheckCircle, FileText } from 'lucide-react';

// === OVAJ DEO KODA JE NEDOSTAJAO U PRETHODNOJ VERZIJI ===
const createStyledIcon = (iconHtml) => {
    return L.divIcon({
        html: iconHtml,
        className: 'leaflet-styled-icon',
        iconSize: [48, 48],
        iconAnchor: [24, 48],
    });
};

const restaurantIcon = createStyledIcon(
    ReactDOMServer.renderToString(<div className="flex items-center justify-center w-12 h-12"><div className="p-2 bg-white rounded-full shadow-lg border-2 border-purple-500"><Store size={24} className="text-purple-600"/></div></div>)
);

const customerIcon = createStyledIcon(
    ReactDOMServer.renderToString(<div className="flex items-center justify-center w-12 h-12"><div className="p-2 bg-white rounded-full shadow-lg border-2 border-green-500"><Home size={24} className="text-green-600"/></div></div>)
);

const driverIcon = createStyledIcon(
    ReactDOMServer.renderToString(<div className="relative flex items-center justify-center w-12 h-12"><div className="absolute animate-ping w-8 h-8 bg-pink-400 rounded-full opacity-75"></div><div className="relative p-3 bg-pink-600 rounded-full shadow-lg border-2 border-white"><Bike size={24} className="text-white"/></div></div>)
);

const TimelineStep = ({ icon, title, time, isCompleted }) => (
    <li className={`flex items-center gap-4 ${isCompleted ? '' : 'opacity-40'}`}>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isCompleted ? 'bg-pink-500' : 'bg-gray-300'}`}>{icon}</div>
        <div>
            <p className="font-semibold text-gray-800">{title}</p>
            {isCompleted && <p className="text-xs text-gray-500">{time}</p>}
        </div>
    </li>
);
// =======================================================


const MapUpdater = ({ center }) => {
    const map = useMap(); 
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom(), {
                animate: true,
                duration: 1.0 
            });
        }
    }, [center, map]);
    return null;
};

export function ManagerTrackOrderPage() {
    const { orderId } = useParams();
    const [trackData, setTrackData] = useState(null);

    useEffect(() => {
        const fetchData = async () => { try { const data = await getManagerTrackingInfo(orderId); setTrackData(data); } catch (error) { console.error("Greška pri dohvatanju podataka o praćenju:", error); } };
        fetchData();
        const interval = setInterval(fetchData, 4000);
        return () => clearInterval(interval);
    }, [orderId]);

    const LoadingScreen = () => (<div className="w-full h-screen flex items-center justify-center bg-pink-50"><div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-pink-500"></div></div>);
    if (!trackData) return <LoadingScreen />;
    
    const driverPos = [trackData.driverLocation.latitude, trackData.driverLocation.longitude];
    const restaurantPos = [trackData.restaurantLocation.latitude, trackData.restaurantLocation.longitude];
    const customerPos = [trackData.customerLocation.latitude, trackData.customerLocation.longitude];

    return (
        <div className="relative w-screen h-screen">
            <div className="absolute top-0 left-0 z-[1000] w-full max-w-md h-full flex flex-col bg-white/70 backdrop-blur-xl shadow-2xl border-r border-white/50">
                <div className="flex-shrink-0 p-4 bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                    <Link to="/manager/deliveries" className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity"><ArrowLeft size={16} /> Nazad na Dostave</Link>
                    <h1 className="text-2xl font-bold mt-2">{trackData.orderNumber}</h1>
                </div>
                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                    <div className="text-center p-6 bg-white/50 rounded-xl">
                        <p className="text-sm font-semibold text-gray-500">Procenjeno vreme dolaska</p>
                        <div className="flex items-center justify-center gap-3 mt-1">
                            <Clock size={36} className="text-pink-600"/>
                            <p className="text-5xl font-bold text-gray-800">{new Date(trackData.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                    <ul className="space-y-4">
                        <TimelineStep icon={<CheckCircle size={20} className="text-white"/>} title="Vozač preuzeo" time={trackData.pickedUpAt ? new Date(trackData.pickedUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} isCompleted={true}/>
                    </ul>
                    <div className="p-4 bg-white/50 rounded-xl space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center"><User size={24} className="text-gray-500"/></div>
                            <div>
                                <p className="font-bold text-gray-800">{trackData.driverName}</p>
                                <p className="text-xs text-gray-500">{trackData.vehicleInfo}</p>
                            </div>
                        </div>
                        <a href={`tel:${trackData.driverPhone}`} className="flex items-center gap-3 text-sm font-medium text-pink-600 hover:underline"><Phone size={16}/> {trackData.driverPhone}</a>
                    </div>
                     <div className="p-4 bg-white/50 rounded-xl space-y-2">
                         <p className="font-bold text-gray-800">{trackData.customerName}</p>
                         <p className="text-sm text-gray-600">{trackData.customerAddress}</p>
                    </div>
                    <details className="bg-white/50 rounded-xl p-4 cursor-pointer">
                        <summary className="font-bold text-gray-800 flex items-center gap-2"><FileText size={18}/>Sadržaj porudžbine</summary>
                        <ul className="mt-3 text-sm text-gray-600 list-disc list-inside space-y-1">
                           {(trackData?.items || []).map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </details>
                </div>
            </div>

            <div className="w-full h-full">
                <MapContainer center={driverPos} zoom={14} scrollWheelZoom={true} style={{ height: "100%", width: "100%", zIndex: 1 }}>
                    <MapUpdater center={driverPos} />
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'/>
                    
                    <Marker position={restaurantPos} icon={restaurantIcon}><Tooltip>Restoran</Tooltip></Marker>
                    
                    <Marker 
                        key={`${driverPos[0]}-${driverPos[1]}`} 
                        position={driverPos} 
                        icon={driverIcon}
                    >
                        <Tooltip>Vozač</Tooltip>
                    </Marker>
                    
                    <Marker position={customerPos} icon={customerIcon}><Tooltip>Kupac</Tooltip></Marker>
                    
                    <Polyline positions={[restaurantPos, driverPos]} color="#A855F7" weight={4} dashArray="1, 8" />
                    <Polyline positions={[driverPos, customerPos]} color="#EC4899" weight={5} />
                </MapContainer>
            </div>
        </div>
    );
}