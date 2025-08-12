import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { getTrackingInfo } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import L from 'leaflet';
import { differenceInSeconds, format } from 'date-fns';
import toast from 'react-hot-toast';
import RoutingMachine from '@/components/RoutingMachine'; 
// --- KREIRANJE IKONICA ---
import { renderToStaticMarkup } from 'react-dom/server';
import { Home, Store, Bike } from 'lucide-react'; // Zamenili smo Moped sa Bike

// Pomoćna funkcija za kreiranje divIcon-a od React komponente
const createDivIcon = (iconComponent) => {
  return L.divIcon({
    html: renderToStaticMarkup(iconComponent),
    className: 'bg-transparent border-0', // Uklanja podrazumevanu pozadinu
    iconSize: [40, 40],
    iconAnchor: [20, 40], // Sidro na dnu ikonice
  });
};

// Definicije React komponenti za ikonice
const restaurantIconComponent = (
    <div className="relative flex items-center justify-center">
        <Store size={40} className="text-white bg-black rounded-full p-2 shadow-lg" />
    </div>
);
const driverIconComponent = (
    <div className="relative flex items-center justify-center">
        <Bike size={40} className="text-black bg-[#D4A056] rounded-full p-2 shadow-lg" />
    </div>
);
const customerIconComponent = (
    <div className="relative flex items-center justify-center">
        <Home size={40} className="text-white bg-black rounded-full p-2 shadow-lg" />
    </div>
);

// Kreiranje Leaflet ikonica
const restaurantIcon = createDivIcon(restaurantIconComponent);
const driverIcon = createDivIcon(driverIconComponent);
const customerIcon = createDivIcon(customerIconComponent);


// --- POMOĆNE KOMPONENTE ---

// Komponenta koja automatski centrira i zumira mapu
const MapUpdater = ({ positions }) => {
    const map = useMap();
    useEffect(() => {
        if (positions && positions.length > 0) {
            map.fitBounds(positions, { padding: [50, 50] });
        }
    }, [positions, map]);
    return null;
};

// Komponenta za dinamički tajmer
const EtaTimer = ({ eta }) => {
    const calculateRemaining = React.useCallback(() => {
        const now = new Date();
        const etaDate = new Date(eta);
        const diff = differenceInSeconds(etaDate, now);
        return Math.max(0, diff);
    }, [eta]);

    const [remainingSeconds, setRemainingSeconds] = useState(calculateRemaining);

    useEffect(() => {
        const timer = setInterval(() => {
            setRemainingSeconds(calculateRemaining());
        }, 1000);
        return () => clearInterval(timer);
    }, [calculateRemaining]);

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return (
        <p className="text-sm text-gray-500 mt-2">
            (~ {minutes} min {seconds.toString().padStart(2, '0')} sec remaining)
        </p>
    );
};


// --- GLAVNA KOMPONENTA STRANICE ---

export function TrackOrderPage() {
    const { orderId } = useParams();
    const [trackInfo, setTrackInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrackingData = async () => {
            try {
                const data = await getTrackingInfo(orderId);
                setTrackInfo(data);
            } catch (error) {
                toast.error("Could not load tracking information.");
            } finally {
                setLoading(false);
            }
        };

        fetchTrackingData();
        const interval = setInterval(fetchTrackingData, 10000); // Osvežavaj na 10 sekundi
        return () => clearInterval(interval);
    }, [orderId]);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading map...</div>;
    if (!trackInfo) return <div className="flex justify-center items-center h-screen">Could not load tracking information.</div>;

    const { restaurantLocation, driverLocation, customerLocation } = trackInfo;
    const allPositions = [
        [restaurantLocation.lat, restaurantLocation.lng],
        [driverLocation.lat, driverLocation.lng],
        [customerLocation.lat, customerLocation.lng]
    ];
    
    const fullRouteWaypoints = [
        [restaurantLocation.lat, restaurantLocation.lng],
        [customerLocation.lat, customerLocation.lng]
    ];

    return (
        <div className="flex flex-col h-screen bg-[#F9F5EC]">
            <Navbar />
            <div className="flex flex-grow overflow-hidden flex-col md:flex-row">
                <div className="w-full md:w-2/3 h-1/2 md:h-full">
                    <MapContainer center={[driverLocation.lat, driverLocation.lng]} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} attributionControl={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                        
                        <Marker position={[restaurantLocation.lat, restaurantLocation.lng]} icon={restaurantIcon} />
                        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} />
                        <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon} />
                        
                        <RoutingMachine waypoints={fullRouteWaypoints} />

                        
                        <MapUpdater positions={allPositions} />
                    </MapContainer>
                </div>
                <div className="w-full md:w-1/3 h-1/2 md:h-full bg-[#FAF7F0] p-8 flex flex-col relative overflow-y-auto">
                    <Link to="/orders" className="absolute top-4 right-8 text-sm text-[#D4A056] hover:underline">
                        ← Back to My Orders
                    </Link>
                    <div className="mt-12">
                        <h1 className="text-3xl font-bold mb-8 text-gray-800">Tracking Order #{trackInfo.orderId}</h1>
                        <div className="space-y-5">
                            <div>
                                <p className="font-semibold text-gray-800">Driver:</p>
                                <p className="text-gray-600">{trackInfo.driverName}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Customer:</p>
                                <p className="text-gray-600">{trackInfo.customerName}</p>
                                <p className="text-sm text-gray-500">{trackInfo.customerAddress}</p>
                            </div>
                            <div className="mt-6">
                                <p className="font-semibold text-lg text-gray-800">Estimated Arrival (ETA):</p>
                                <p className="text-5xl font-bold text-[#D4A056]">
                                    {format(new Date(trackInfo.eta), 'HH:mm')}
                                </p>
                                <EtaTimer eta={trackInfo.eta} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}