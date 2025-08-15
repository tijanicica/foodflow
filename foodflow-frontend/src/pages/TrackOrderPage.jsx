import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import { getTrackingInfo } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import L from 'leaflet';
import { differenceInSeconds, format } from 'date-fns';
import toast from 'react-hot-toast';
import RoutingMachine from '@/components/RoutingMachine'; 
import { renderToStaticMarkup } from 'react-dom/server';
import { Home, Store, Bike, ArrowLeft, CheckCircle, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// --- IKONICE (redizajnirane za bolji kontrast i stil) ---
const createDivIcon = (iconComponent) => L.divIcon({
  html: renderToStaticMarkup(iconComponent),
  className: 'bg-transparent border-0',
  iconSize: [44, 44],
  iconAnchor: [22, 44],
});
const restaurantIcon = createDivIcon(<div className="bg-white p-2 rounded-full shadow-lg"><Store size={28} className="text-gray-700" /></div>);
const driverIcon = createDivIcon(<div className="bg-brand-primary p-2 rounded-full shadow-lg border-2 border-white"><Bike size={28} className="text-white" /></div>);
const customerIcon = createDivIcon(<div className="bg-white p-2 rounded-full shadow-lg"><Home size={28} className="text-gray-700" /></div>);

// --- POMOĆNE KOMPONENTE ---
const MapUpdater = ({ positions }) => {
    const map = useMap();
    useEffect(() => { if (positions?.length > 0) { map.fitBounds(positions, { padding: [70, 70] }); } }, [positions, map]);
    return null;
};
const EtaTimer = ({ eta }) => {
    const calculateRemaining = useCallback(() => {
        if (!eta) return 0;
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
            <div className="w-full md:w-3/5 bg-gray-300"></div>
            <div className="w-full md:w-2/5 bg-white p-8 space-y-6">
                <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-16 w-1/2 bg-gray-200 rounded-lg"></div>
                <div className="space-y-4 pt-4 border-t mt-6">
                    <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
                    <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
                    <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        </div>
    </div>
);

//================================================================================
// GLAVNA KOMPONENTA STRANICE
//================================================================================
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
            finally { if(loading) setLoading(false); }
        };
        fetchTrackingData();
        const interval = setInterval(fetchTrackingData, 10000);
        return () => clearInterval(interval);
    }, [orderId, loading]);

    if (loading) return <TrackingPageSkeleton />;
    if (!trackInfo) return (
        <div className="flex h-screen w-full flex-col">
            <Navbar/>
            <div className="flex-grow flex items-center justify-center text-center">
                <div>
                    <h2 className="text-2xl font-bold">Could not load tracking information.</h2>
                    <p className="text-gray-600">This order might not be available for tracking.</p>
                    <Link to="/orders"><Button className="mt-4 bg-brand-primary hover:bg-brand-primary/90">Back to My Orders</Button></Link>
                </div>
            </div>
        </div>
    );
    
    const { restaurantLocation, driverLocation, customerLocation, restaurantName, driverName, eta, customerAddress, orderItems } = trackInfo;
    const allPositions = [
        [restaurantLocation.lat, restaurantLocation.lng],
        [driverLocation.lat, driverLocation.lng],
        [customerLocation.lat, customerLocation.lng]
    ];
    const driverToCustomerRoute = [
        [driverLocation.lat, driverLocation.lng],
        [customerLocation.lat, customerLocation.lng]
    ];

    return (
        <div className="flex flex-col h-screen bg-[#F9F5EC]">
            <Navbar />
            <div className="flex flex-grow overflow-hidden flex-col-reverse md:flex-row">
                <motion.div 
                    initial={{ x: '-100%' }} animate={{ x: 0 }} transition={{ duration: 0.5 }}
                    className="w-full md:w-2/5 lg:w-1/3 h-auto md:h-full bg-white p-6 flex flex-col relative overflow-y-auto border-r"
                >
                    <div className="flex-grow">
                        <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline mb-4">
                            <ArrowLeft size={16} /> Back to My Orders
                        </Link>
                        
                        <div className="my-4 text-center">
                            <p className="text-sm text-gray-500">Estimated Arrival</p>
                            <p className="text-6xl font-extrabold text-brand-primary">{eta ? format(new Date(eta), 'HH:mm') : '--:--'}</p>
                            {eta && <EtaTimer eta={eta} />}
                        </div>
                        <div className="border-t border-dashed my-6"></div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <CheckCircle size={24} className="text-green-500 flex-shrink-0 mt-1"/>
                                <div>
                                    <p className="font-semibold text-gray-800">Order from {restaurantName}</p>
                                    <p className="text-xs text-gray-500">Your order is confirmed and being prepared.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Bike size={24} className="text-brand-primary flex-shrink-0 mt-1"/>
                                <div>
                                    <p className="font-semibold text-gray-800">{driverName} is on the way</p>
                                    <p className="text-xs text-gray-500">Your driver has picked up the order.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Home size={24} className="text-gray-400 flex-shrink-0 mt-1"/>
                                <div>
                                    <p className="font-semibold text-gray-500">Delivering to your address</p>
                                    <p className="text-xs text-gray-500">{customerAddress}</p>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-dashed my-6"></div>

                        {/* === DODAT JE SAŽETAK PORUDŽBINE === */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><ShoppingCart size={16}/> Your Order</h3>
                            <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                                {(orderItems && orderItems.length > 0) ? orderItems.map(item => (
                                    <div key={item.name} className="flex justify-between text-sm p-2 rounded-md hover:bg-gray-50">
                                        <span className="text-gray-600 truncate">{item.quantity} x {item.name}</span>
                                    </div>
                                )) : <p className="text-sm text-gray-500">No items to display.</p>}
                            </div>
                        </div>
                    </div>
                </motion.div>
                
                <div className="w-full md:w-3/5 lg:w-2/3 h-1/2 md:h-full">
                    <MapContainer center={[driverLocation.lat, driverLocation.lng]} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true} attributionControl={false}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                        <Marker position={[restaurantLocation.lat, restaurantLocation.lng]} icon={restaurantIcon}><Popup>{restaurantName}</Popup></Marker>
                        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}><Popup>Your driver: {driverName}</Popup></Marker>
                        <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}><Popup>Your Address</Popup></Marker>
                        <RoutingMachine waypoints={driverToCustomerRoute} />
                        <MapUpdater positions={allPositions} />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}