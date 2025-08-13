// FAJL: src/pages/PickedUpOrderPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

// WebSocket i API
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import { getOrderDetails, cancelDelivery,getDriverInfo, startSimulation  } from '../services/api'; 

// Komponente i ikonice
import { MapComponent } from '../components/MapComponent';
import { NavbarDriver } from '../components/NavbarDriver';
import { FiMapPin, FiUser, FiCheckCircle, FiNavigation, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

export function PickedUpOrderPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    // Stanja (State)
    const [order, setOrder] = useState(null);
    const [vehicleType, setVehicleType] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    // useEffect za dobavljanje podataka i WebSocket konekciju
        useEffect(() => {
        let stompClient = null;

        const fetchPageData = async () => {
            try {
                setLoading(true);
                const [orderDetails, driverInfo] = await Promise.all([
                    getOrderDetails(orderId),
                    getDriverInfo()
                ]);

                setOrder(orderDetails);
                setVehicleType(driverInfo.vehicleType);

                // --- KLJUČNA IZMENA ---
                // Prvo pokušavamo da uzmemo lokaciju iz driverInfo DTO-a,
                // jer on uvek sadrži najsvežije podatke o vozaču.
                if (driverInfo.latitude && driverInfo.longitude) {
                    setDriverLocation({
                        lat: driverInfo.latitude,
                        lng: driverInfo.longitude
                    });
                } 
                // Ako iz nekog razloga to ne uspe, koristimo fallback iz orderDetails
                else if (orderDetails.driverCoordinates) {
                    setDriverLocation(orderDetails.driverCoordinates);
                }
                // --------------------

                return true; // Signaliziramo uspeh da bi se pokrenuo WebSocket
            } catch (err) {
                setError('Failed to load page data. The order might not be assigned to you.');
                return false; // Signaliziramo neuspeh
            } finally {
                setLoading(false);
            }
        };

        fetchPageData().then((isDataLoaded) => {
            if (isDataLoaded) {
                const socket = new SockJS('http://localhost:8088/ws');
                stompClient = Stomp.over(socket);
                stompClient.debug = null;

                stompClient.connect({}, () => {
                    console.log('Connected to WebSocket');
                    stompClient.subscribe(`/topic/driver-location/${orderId}`, (message) => {
                        const newLocation = JSON.parse(message.body);
                        setDriverLocation({ 
                            lat: newLocation.lat, 
                            lng: newLocation.lng 
                        });
                    });
                });
            }
        });

        // Cleanup funkcija
        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect(() => console.log('Disconnected from WebSocket'));
            }
        };
    }, [orderId]);

    // Handler za pokretanje simulacije
    const handleStartDriving = async () => {
        if (!order) return;
        try {
            toast.loading('Starting simulation...', { id: 'sim-start' });
            await startSimulation(order.id);
            toast.dismiss('sim-start');
            toast.success("Simulation to customer started!");
        } catch (error) {
            toast.dismiss('sim-start');
            toast.error("Could not start simulation.");
        }
    };

    // TODO: Handleri za ostale akcije
    const handleMarkAsDelivered = () => alert("TODO: Implement Mark as Delivered!");
    const handleReportDelay = () => alert("TODO: Implement Report Delay!");
    const handleCancelDelivery = () => setIsCancelModalOpen(true);

    // Memoizacija props-ova za mapu
        // Memoizacija props-ova za mapu
    const assignedDeliveriesForMap = useMemo(() => {
        if (!order) {
            return [];
        }

        // Kreiramo NOVI objekat za mapu koji sadrži SAMO potrebne podatke za ovu stranicu.
        // Izostavljamo koordinate restorana.
        const deliveryForMap = {
            id: order.id,
            deliveryAddress: order.deliveryAddress,
            deliveryCoordinates: order.deliveryCoordinates,
            // Polje 'restaurantCoordinates' namerno izostavljamo
        };
        
        return [deliveryForMap];
    }, [order]);
    const newOffersForMap = useMemo(() => [], []);

    // Stilovi
    const primaryButtonStyle = { padding: '1rem', borderRadius: '8px', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'background-color 0.2s ease-in-out', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' };
    const secondaryButtonStyle = { flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1.5px solid #D1D5DB', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600', color: '#4A4A4A', transition: 'all 0.2s ease-in-out', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' };

    if (loading) return <div>Loading...</div>; // Skraćeni prikaz
    if (error || !order) return <div>{error || 'Order not found.'}</div>;
    
    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh', color: '#4A4A4A' }}>
            <Toaster position="top-center" />
            <NavbarDriver />
            <main style={{ maxWidth: '1500px', margin: '20px auto', padding: '0 2rem' }}>
                <div style={{ backgroundColor: '#FDFDF5', padding: '2rem', borderRadius: '24px', border: '1px solid #F3EAD9', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem', alignItems: 'start' }}>
                    
                    {/* LEVA KOLONA - MAPA */}
                    <div style={{ height: '75vh', borderRadius: '16px', overflow: 'hidden' }}>
                        {driverLocation && (
                            <MapComponent
                                driverLocation={driverLocation}
                                assignedDeliveries={assignedDeliveriesForMap}
                                newOffers={newOffersForMap}
                                vehicleType={vehicleType} 
                                activeRouteId={order.id} 
                            />
                        )}
                    </div>

                    {/* DESNA KOLONA - INFORMACIJE */}
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #EAEAEA' }}>
                            <p style={{ textTransform: 'uppercase', color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>ESTIMATED ARRIVAL (ETA)</p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.25rem 0 0 0', color: '#333' }}>
                                {order.eta ? new Date(order.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </p>
                        </div>
                        
                        {/* Step 1 je završen, pa je blago zatamnjen */}
                        <div style={{ marginTop: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #EAEAEA' , opacity: 0.6 }}>
                            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', margin: 0, color: '#8A643B' }}>STEP 1: PICKUP</p>
                            <p style={{ fontSize: '1.1rem', margin: '0.5rem 0 0.25rem 0', fontWeight: '500' }}>{order.restaurantName}</p>
                        </div>

                        {/* Step 2 je aktivan */}
                        <div style={{ marginTop: '1.5rem' }}>
                            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', margin: 0, color: '#2F855A' }}>STEP 2: DELIVER</p>
                            <p style={{ fontSize: '1.1rem', margin: '0.5rem 0 0.25rem 0', fontWeight: '500' }}>{order.customerFirstName} {order.customerLastName}</p>
                            <p style={{ color: '#6B7280', margin: 0 }}>{order.deliveryAddress}</p>
                        </div>

                        {/* DUGMAD */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto', paddingTop: '1.5rem' }}>
                            <button
                                onClick={handleStartDriving}
                                style={{ ...primaryButtonStyle, backgroundColor: '#8A643B' }}
                            >
                                <FiNavigation /> Start Driving to Customer
                            </button>
                            <button
                                onClick={handleMarkAsDelivered}
                                style={{ ...primaryButtonStyle, backgroundColor: '#2E7D32' }}
                            >
                                <FiCheckCircle /> Mark as Delivered
                            </button>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={handleReportDelay} style={secondaryButtonStyle}>
                                    <FiAlertTriangle size={14} /> Report Delay
                                </button>
                                <button onClick={handleCancelDelivery} style={secondaryButtonStyle}>
                                    <FiXCircle size={14} /> Cancel Delivery
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}