import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
import { Car, Bike, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { AdminNavbar } from '@/components/AdminNavbar';
import { getLiveDriverLocations } from '@/services/api'; // Importujemo novu funkciju

// === Pomoćne funkcije za ikone na mapi ===

// Biramo ikonu na osnovu tipa vozila
const getVehicleIconComponent = (vehicleType) => {
    switch (vehicleType?.toUpperCase()) {
        case 'CAR': return Car;
        case 'MOTORCYCLE': return Bike;
        case 'BICYCLE': return Bike;
        default: return MapPin;
    }
};

// Kreiramo stilizovanu ikonu sa odgovarajućom bojom statusa
const createDriverIcon = (vehicleType, status) => {
    const Icon = getVehicleIconComponent(vehicleType);
    let bgColor = '#6B7280'; // Siva za OFFLINE
    if (status === 'ONLINE') bgColor = '#10B981'; // Zelena za ONLINE
    if (status === 'BUSY') bgColor = '#F59E0B'; // Žuta za BUSY

    const iconHtml = renderToStaticMarkup(
        <div style={{
            backgroundColor: bgColor,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
            <Icon size={18} color="white" />
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: 'custom-driver-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
    });
};

// Komponenta koja automatski centrira mapu da prikaže sve markere
const FitBounds = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        } else {
            map.setView([44.7866, 20.4489], 12); // Fallback na Beograd
        }
    }, [bounds, map]);
    return null;
};

// === Glavna komponenta mape za admina ===
const AdminLiveMap = ({ drivers = [] }) => {
    const bounds = useMemo(() => {
        return drivers
            .filter(driver => driver.latitude && driver.longitude)
            .map(driver => [driver.latitude, driver.longitude]);
    }, [drivers]);

    return (
        <MapContainer center={[44.7866, 20.4489]} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {drivers.map(driver => (
                driver.latitude && driver.longitude && (
                    <Marker
                        key={driver.id}
                        position={[driver.latitude, driver.longitude]}
                        icon={createDriverIcon(driver.vehicleType, driver.status)}
                    >
                        <Popup>
                            <div className="font-sans">
                                <strong className="text-base">{driver.firstName} {driver.lastName}</strong>
                                <p className="mt-1 mb-0">Status: <span className="font-semibold">{driver.status}</span></p>
                                {driver.activeOrderId && <p className="mb-0">Active Order: <span className="font-semibold">#{driver.activeOrderId}</span></p>}
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}

            <FitBounds bounds={bounds} />
        </MapContainer>
    );
};

// === Glavna stranica ===
export function AdminLiveTrackingPage() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDriverData = async () => {
            try {
                const data = await getLiveDriverLocations();
                setDrivers(data);
            } catch (error) {
                toast.error("Failed to load driver locations.");
            } finally {
                setLoading(false);
            }
        };

        // Prvo dohvatanje podataka
        fetchDriverData();

        // Postavljanje intervala za periodično dohvatanje na svakih 5 sekundi
        const intervalId = setInterval(fetchDriverData, 5000);

        // Čišćenje intervala kada se komponenta uništi
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="min-h-screen bg-[#FFFDF6]">
            <AdminNavbar />

            <main className="container mx-auto p-6 lg:p-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-extrabold text-[#3D3D3D] tracking-tight">Live Tracking</h1>
                    <p className="mt-2 text-lg text-gray-500">Real-time overview of all active drivers on the map.</p>
                </motion.div>

                <motion.div 
                    className="h-[85vh] p-4 bg-[#FDFBF6] rounded-3xl shadow-lg border border-gray-200"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-gray-500 font-semibold">
                            Loading map and driver data...
                        </div>
                    ) : (
                        <AdminLiveMap drivers={drivers} />
                    )}
                </motion.div>
            </main>
        </div>


    );
}