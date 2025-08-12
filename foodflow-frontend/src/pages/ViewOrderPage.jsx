// FAJL: src/pages/ViewOrderPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NavbarDriver } from '../components/NavbarDriver';
import { MapComponent } from '../components/MapComponent';
import { getOrderDetails } from '../services/api'; // ISPRAVLJENO IME FUNKCIJE

// TODO: Uvezite API funkcije za: markAsPickedUp, reportDelay, cancelDelivery

export function ViewOrderPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [driverLocation, setDriverLocation] = useState({ lat: 44.8125, lng: 20.4612 });

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const data = await getOrderDetails(orderId); // ISPRAVLJENO IME FUNKCIJE
                setOrder(data);
            } catch (err) {
                setError('Failed to load order details. The order might not be assigned to you.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handleMarkAsPickedUp = () => alert("TODO: Implement Mark as Picked Up!");
    const handleReportDelay = () => alert("TODO: Implement Report Delay!");
    const handleCancelDelivery = () => alert("TODO: Implement Cancel Delivery!");

    // Prvo rukujemo stanjima učitavanja i greške
    if (loading) {
        return (
            <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh' }}>
                <NavbarDriver />
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading order details...</div>
            </div>
        );
    }
    if (error) {
        return (
            <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh' }}>
                <NavbarDriver />
                <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>
            </div>
        );
    }
    if (!order) {
        return (
            <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh' }}>
                <NavbarDriver />
                <div style={{ padding: '2rem', textAlign: 'center' }}>Order not found.</div>
            </div>
        );
    }
    
    // Ako su podaci tu, renderiramo glavni sadržaj
    const isPickedUp = order.status === 'PICKED_UP';
    
    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh', color: '#4A4A4A' }}>
            <NavbarDriver />
            <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
                <div style={{
                    backgroundColor: '#FDF8E8', padding: '2rem', borderRadius: '24px',
                    border: '1px solid #F3EAD9', boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
                    display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem', alignItems: 'start'
                }}>
                    
                    <div style={{ height: '75vh', borderRadius: '16px', overflow: 'hidden' }}>
                        <MapComponent
                            driverLocation={driverLocation}
                            assignedDeliveries={[order]}
                            newOffers={[]}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                        <div>
                            <p style={{ textTransform: 'uppercase', color: '#6B7280', fontSize: '0.9rem', margin: 0, letterSpacing: '0.5px' }}>Estimated Arrival (ETA)</p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.25rem 0 0 0', color: '#333' }}>
                                {order.eta ? new Date(order.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </p>
                        </div>
                        
                        <div style={{ borderTop: '1px solid #EAEAEA', paddingTop: '1.5rem' }}>
                            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', margin: 0, color: '#8A643B' }}>Step 1: Pickup</p>
                            <p style={{ fontSize: '1.2rem', margin: '0.5rem 0 0.25rem 0', fontWeight: '500' }}>{order.restaurantName}</p>
                            <p style={{ color: '#6B7280', margin: 0 }}>{order.restaurantAddress}</p>
                        </div>

                        <div style={{ borderTop: '1px solid #EAEAEA', paddingTop: '1.5rem' }}>
                            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', margin: 0, color: '#2F855A' }}>Step 2: Deliver</p>
                            <p style={{ fontSize: '1.2rem', margin: '0.5rem 0 0.25rem 0', fontWeight: '500' }}>
                                {order.customerFirstName} {order.customerLastName}
                            </p>
                            <p style={{ color: '#6B7280', margin: 0 }}>{order.deliveryAddress}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto', paddingTop: '1.5rem' }}>
                            {isPickedUp ? (
                                <button style={{ padding: '1rem', borderRadius: '8px', border: 'none', backgroundColor: '#2E7D32', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                                    Mark as Delivered
                                </button>
                            ) : (
                                <button onClick={handleMarkAsPickedUp} style={{ padding: '1rem', borderRadius: '8px', border: 'none', backgroundColor: '#1F2937', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                                    Mark as Picked Up
                                </button>
                            )}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={handleReportDelay} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: 'white', cursor: 'pointer', fontWeight: '500' }}>Report Delay</button>
                                <button onClick={handleCancelDelivery} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: 'white', cursor: 'pointer', fontWeight: '500' }}>Cancel Delivery</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}