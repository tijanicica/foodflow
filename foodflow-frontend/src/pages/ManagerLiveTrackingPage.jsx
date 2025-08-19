import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
import { Car, Bike, MapPin, Home, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import { getManagerLiveTracking } from '@/services/api';
import RoutingMachine from '@/components/RoutingMachine';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar'; // Uvoz navigacije

// === Pomoćne funkcije za ikone (sada popunjene) ===

const getVehicleIconComponent = (vehicleType) => {
    switch (vehicleType?.toUpperCase()) {
        case 'CAR': return Car;
        case 'MOTORCYCLE': return Bike;
        case 'BICYCLE': return Bike;
        default: return MapPin;
    }
};

const createStyledIcon = (IconComponent, bgColor, size = 20) => {
    const iconHtml = renderToStaticMarkup(
        <div style={{
            backgroundColor: bgColor,
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
            <IconComponent size={size} color="white" />
        </div>
    );
    return L.divIcon({
        html: iconHtml,
        className: 'custom-styled-icon',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38]
    });
};

const createDriverIcon = (vehicleType) => {
    const Icon = getVehicleIconComponent(vehicleType);
    return createStyledIcon(Icon, '#F59E0B'); // Žuta za vozača
};

const createHomeIcon = () => createStyledIcon(Home, '#10B981'); // Zelena za kupca
const createRestaurantIcon = () => createStyledIcon(Store, '#3B82F6'); // Plava za restoran

// Komponenta koja automatski centrira mapu
const FitBoundsToMarkers = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
        } else {
            map.setView([44.7866, 20.4489], 12); // Fallback na Beograd
        }
    }, [bounds, map]);
    return null;
};

// === Komponenta za Mapu (unapređena) ===
const ManagerTrackingMap = ({ deliveries }) => {
    const bounds = useMemo(() => {
        const points = [];
        deliveries.forEach(d => {
            if (d.driverLatitude && d.driverLongitude) points.push([d.driverLatitude, d.driverLongitude]);
            if (d.deliveryAddressLat && d.deliveryAddressLng) points.push([d.deliveryAddressLat, d.deliveryAddressLng]);
            // Pretpostavka da backend vraća i koordinate restorana
            if (d.restaurantLat && d.restaurantLng) points.push([d.restaurantLat, d.restaurantLng]);
        });
        return points;
    }, [deliveries]);

    const homeIcon = useMemo(() => createHomeIcon(), []);
    const restaurantIcon = useMemo(() => createRestaurantIcon(), []);

    return (
        <MapContainer center={[44.78, 20.44]} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '1rem' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
            
            {deliveries.map(delivery => (
                <React.Fragment key={delivery.orderId}>
                    {/* Marker za vozača */}
                    <Marker
                        position={[delivery.driverLatitude, delivery.driverLongitude]}
                        icon={createDriverIcon(delivery.vehicleType)}
                    >
                        <Popup><b>{delivery.driverFirstName} {delivery.driverLastName}</b><br/>Order #{delivery.orderId}</Popup>
                    </Marker>
                    
                    {/* Marker za kupca */}
                    <Marker
                        position={[delivery.deliveryAddressLat, delivery.deliveryAddressLng]}
                        icon={homeIcon}
                    >
                        <Popup>Delivery for Order #{delivery.orderId}</Popup>
                    </Marker>
                    
                    {/* Marker za restoran (ako postoje podaci) */}
                    {delivery.restaurantLat && delivery.restaurantLng && (
                         <Marker
                            position={[delivery.restaurantLat, delivery.restaurantLng]}
                            icon={restaurantIcon}
                        >
                            <Popup>Pickup for Order #{delivery.orderId}</Popup>
                        </Marker>
                    )}

                    {/* Ruta između vozača i kupca */}
                    <RoutingMachine
                        key={delivery.orderId}
                        waypoints={[
                            L.latLng(delivery.driverLatitude, delivery.driverLongitude),
                            L.latLng(delivery.deliveryAddressLat, delivery.deliveryAddressLng)
                        ]}
                    />
                </React.Fragment>
            ))}

            <FitBoundsToMarkers bounds={bounds} />
        </MapContainer>
    );
};

// === Glavna Stranica (kompletno stilizovana) ===
export function ManagerLiveTrackingPage() {
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getManagerLiveTracking();
                setActiveDeliveries(data);
            } catch (err) {
                if (loading) toast.error("Could not load live tracking data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 7000);

        return () => clearInterval(interval);
    }, [loading]);

    return (
        <div className="min-h-screen bg-gray-50">
            <ManagerNavbar />
            
            <main className="container mx-auto p-6 lg:p-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Live Delivery Tracking</h1>
                    <p className="mt-2 text-lg text-gray-500">Real-time overview of all ongoing deliveries from your restaurants.</p>
                </motion.div>

                <motion.div
                    className="h-[75vh] bg-white rounded-2xl shadow-lg border border-gray-200 p-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-gray-500 font-semibold">
                            Loading map and active deliveries...
                        </div>
                    ) : activeDeliveries.length > 0 ? (
                        <ManagerTrackingMap deliveries={activeDeliveries} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                           <MapPin size={48} className="mb-4 text-gray-400" />
                           <h3 className="text-xl font-semibold">No Active Deliveries</h3>
                           <p>There are currently no drivers on their way to customers.</p>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}