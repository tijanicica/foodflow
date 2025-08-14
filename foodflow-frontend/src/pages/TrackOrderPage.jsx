import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { getTrackingInfo } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import L from 'leaflet';
import { differenceInSeconds, format } from 'date-fns';
import toast from 'react-hot-toast';
import RoutingMachine from '@/components/RoutingMachine'; 
import { renderToStaticMarkup } from 'react-dom/server';
import { Home, Store, Bike, ArrowLeft } from 'lucide-react';

// --- IKONICE (BEZ PROMENA) ---
const createDivIcon = (iconComponent) => L.divIcon({
  html: renderToStaticMarkup(iconComponent),
  className: 'bg-transparent border-0',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const restaurantIcon = createDivIcon(<Store size={40} className="text-white bg-gray-800 rounded-full p-2 shadow-lg" />);
const driverIcon = createDivIcon(<Bike size={40} className="text-black bg-[#D4A056] rounded-full p-2 shadow-lg" />);
const customerIcon = createDivIcon(<Home size={40} className="text-white bg-gray-800 rounded-full p-2 shadow-lg" />);


// --- POMOĆNE KOMPONENTE (BEZ PROMENA) ---
const MapUpdater = ({ positions }) => {
    const map = useMap();
    useEffect(() => { if (positions?.length > 0) { map.fitBounds(positions, { padding: [50, 50] }); } }, [positions, map]);
    return null;
};

const EtaTimer = ({ eta }) => {
    const calculateRemaining = useCallback(() => {
        const diff = differenceInSeconds(new Date(eta), new Date());
        return Math.max(0, diff);
    }, [eta]);
    const [remainingSeconds, setRemainingSeconds] = useState(() => calculateRemaining());
    useEffect(() => {
        const timer = setInterval(() => setRemainingSeconds(calculateRemaining()), 1000);
        return () => clearInterval(timer);
    }, [calculateRemaining]);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return <p className="text-sm text-gray-500 mt-2">(~ {minutes} min {seconds.toString().padStart(2, '0')}s remaining)</p>;
};

// --- SKELETON KOMPONENTA ---
const TrackingPageSkeleton = () => (
    <div className="flex flex-col h-screen bg-gray-200">
        <Navbar />
        <div className="flex flex-grow animate-pulse">
            <div className="w-2/3 bg-gray-300"></div>
            <div className="w-1/3 bg-white p-8 space-y-6">
                <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-16 w-1/2 bg-gray-200 rounded"></div>
                <div className="space-y-4 pt-4">
                    <div className="h-10 w-full bg-gray-200 rounded"></div>
                    <div className="h-10 w-full bg-gray-200 rounded"></div>
                    <div className="h-10 w-full bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    </div>
);


// --- GLAVNA REDIZAJNIRANA KOMPONENTA ---
export function TrackOrderPage() {
    const { orderId } = useParams();
    const [trackInfo, setTrackInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrackingData = async () => {
            try {
                const data = await getTrackingInfo(orderId);
                setTrackInfo(data);
            } catch (error) { toast.error("Could not load tracking information."); } 
            finally { setLoading(false); }
        };

        fetchTrackingData();
        const interval = setInterval(fetchTrackingData, 10000);
        return () => clearInterval(interval);
    }, [orderId]);

    if (loading) return <TrackingPageSkeleton />;
    if (!trackInfo) return <div className="flex justify-center items-center h-screen">Could not load tracking information.</div>;

    const { restaurantLocation, driverLocation, customerLocation, restaurantName } = trackInfo;
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
                {/* Leva strana - MAPA */}
                <div className="w-full md:w-2/3 h-1/2 md:h-full">
                    <MapContainer center={[driverLocation.lat, driverLocation.lng]} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true} attributionControl={false}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' />
                        <Marker position={[restaurantLocation.lat, restaurantLocation.lng]} icon={restaurantIcon} />
                        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} />
                        <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon} />
                        <RoutingMachine waypoints={fullRouteWaypoints} />
                        <MapUpdater positions={allPositions} />
                    </MapContainer>
                </div>

                {/* Desna strana - INFORMACIJE */}
                <div className="w-full md:w-1/3 h-1/2 md:h-full bg-white p-8 flex flex-col relative overflow-y-auto border-l">
                    <Link to="/orders" className="absolute top-6 right-8 text-sm text-[#D4A056] hover:underline flex items-center gap-1">
                        <ArrowLeft size={16} /> Back to My Orders
                    </Link>

                    <div className="mt-12">
                        <p className="text-sm text-gray-500">Tracking Order #{trackInfo.orderId}</p>
                        <h1 className="text-3xl font-bold text-gray-800">Estimated Arrival</h1>
                        
                        <div className="my-6">
                            <p className="text-6xl font-bold text-[#D4A056]">{format(new Date(trackInfo.eta), 'HH:mm')}</p>
                            <EtaTimer eta={trackInfo.eta} />
                        </div>

                        {/* Vremenska Linija Isporuke */}
                        <div className="relative border-t pt-6">
                            <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-200"></div>
                            <div className="space-y-6">
                                <div className="relative flex items-center">
                                    <div className="z-10 bg-gray-800 p-2 rounded-full"><Store size={20} className="text-white" /></div>
                                    <p className="ml-4 font-semibold text-gray-700">{restaurantName}</p>
                                </div>
                                <div className="relative flex items-center">
                                    <div className="z-10 bg-[#D4A056] p-2 rounded-full"><Bike size={20} className="text-black" /></div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-700">{trackInfo.driverName}</p>
                                        <p className="text-xs text-gray-500">Your driver is on the way</p>
                                    </div>
                                </div>
                                <div className="relative flex items-center">
                                    <div className="z-10 bg-gray-800 p-2 rounded-full"><Home size={20} className="text-white" /></div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-700">{trackInfo.customerName}</p>
                                        <p className="text-xs text-gray-500">{trackInfo.customerAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}