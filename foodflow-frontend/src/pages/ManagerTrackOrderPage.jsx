import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { getManagerTrackingInfo } from '@/services/api';

// Ikonice
const restaurantIcon = new L.Icon({ iconUrl: '/marker-restaurant.png', iconSize: [40, 40] });
const driverIcon = new L.Icon({ iconUrl: '/marker-driver.png', iconSize: [40, 40] });
const customerIcon = new L.Icon({ iconUrl: '/marker-customer.png', iconSize: [40, 40] });

export function ManagerTrackOrderPage() {
    const { orderId } = useParams();
    const [trackData, setTrackData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getManagerTrackingInfo(orderId);
                setTrackData(data);
            } catch (error) { console.error(error); }
        };
        fetchData();
        const interval = setInterval(fetchData, 10000); // Osvežava na 10s
        return () => clearInterval(interval);
    }, [orderId]);

    if (!trackData) return <div>Loading map...</div>;
    
    const driverPos = [trackData.driverLocation.latitude, trackData.driverLocation.longitude];
    const restaurantPos = [trackData.restaurantLocation.latitude, trackData.restaurantLocation.longitude];
    const customerPos = [trackData.customerLocation.latitude, trackData.customerLocation.longitude];

    return (
        <div className="flex h-screen bg-brand-background-light">
            <div className="w-1/3 p-8 bg-white shadow-lg overflow-y-auto">
                <Link to="/manager/deliveries" className="text-sm mb-6 inline-block">&larr; Back to Deliveries</Link>
                <h1 className="text-2xl font-bold">{trackData.orderNumber}</h1>
                <div className="mt-6 space-y-4 text-sm">
                    <div><p className="font-semibold">Driver:</p><p>{trackData.driverName}</p></div>
                    <div><p className="font-semibold">Customer:</p><p>{trackData.customerName}</p></div>
                    <div><p className="font-semibold">Address:</p><p>{trackData.customerAddress}</p></div>
                    <div><p className="font-semibold">Estimated Arrival (ETA):</p><p className="text-xl font-bold">{new Date(trackData.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
                </div>
            </div>
            <div className="w-2/3">
                <MapContainer center={driverPos} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={restaurantPos} icon={restaurantIcon} />
                    <Marker position={driverPos} icon={driverIcon} />
                    <Marker position={customerPos} icon={customerIcon} />
                    <Polyline positions={[restaurantPos, driverPos]} color="gray" dashArray="5, 10" />
                    <Polyline positions={[driverPos, customerPos]} color="blue" />
                </MapContainer>
            </div>
        </div>
    );
}