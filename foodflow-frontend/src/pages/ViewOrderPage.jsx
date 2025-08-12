// FAJL: src/pages/ViewOrderPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NavbarDriver } from '../components/NavbarDriver';
import { MapComponent } from '../components/MapComponent';
import { getOrderDetails } from '../services/api';
// Uvozimo ikonice
import { FiMapPin, FiUser, FiAlertTriangle, FiXCircle, FiCheckCircle, FiNavigation } from 'react-icons/fi';
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
                const data = await getOrderDetails(orderId);
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

    // Stilovi za gumbe
    const primaryButtonStyle = {
        padding: '1rem', borderRadius: '8px', border: 'none',
        color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
        transition: 'background-color 0.2s ease-in-out, transform 0.1s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
    };
    const secondaryButtonStyle = {
        flex: 1, padding: '0.8rem', borderRadius: '8px',
        border: '1.5px solid #D1D5DB', backgroundColor: 'white',
        cursor: 'pointer', fontWeight: '600', color: '#4A4A4A',
        transition: 'all 0.2s ease-in-out',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
    };

    if (loading || !order) {
        // Prikazujemo loading/error/not found stanja sa Navbarom
        return (
            <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh' }}>
                <NavbarDriver />
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    {loading ? 'Loading order details...' : error ? <span style={{color: 'red'}}>{error}</span> : 'Order not found.'}
                </div>
            </div>
        );
    }
    
    const isPickedUp = order.status === 'PICKED_UP';
    
    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh', color: '#4A4A4A' }}>
            <NavbarDriver />
            <main style={{ maxWidth: '1500px', margin: '20px 90px' }}>
                <div style={{
                    backgroundColor: '#FDFDF5', // <-- VRAĆENA BOJA
                    padding: '2rem', borderRadius: '24px',
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

                    {/* VRAĆEN STARI DIZAJN DESNE KOLONE SA IKONICAMA */}
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #EAEAEA' }}>
                            <p style={{ textTransform: 'uppercase', color: '#6B7280', fontSize: '0.9rem', margin: 0, letterSpacing: '0.5px' }}>Estimated Arrival (ETA)</p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.25rem 0 0 0', color: '#333' }}>
                                {order.eta ? new Date(order.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </p>
                        </div>
                        
                        <div style={{ marginTop: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #EAEAEA' }}>
                            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', margin: 0, color: '#8A643B', display: 'flex', alignItems: 'center' }}>
                                <FiMapPin style={{ marginRight: '0.5rem' }} /> Step 1: Pickup
                            </p>
                            <p style={{ fontSize: '1.2rem', margin: '0.5rem 0 0.25rem 0', fontWeight: '500' }}>{order.restaurantName}</p>
                            <p style={{ color: '#6B7280', margin: 0 }}>{order.restaurantAddress}</p>
                            <p style={{ color: '#333', margin: '0.5rem 0 0 0', fontWeight: '500' }}>
                                Distance from you: {order.distanceDriverToRestaurant.toFixed(1)} km
                            </p>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', margin: 0, color: '#2F855A', display: 'flex', alignItems: 'center' }}>
                                <FiUser style={{ marginRight: '0.5rem' }} /> Step 2: Deliver
                            </p>
                            <p style={{ fontSize: '1.2rem', margin: '0.5rem 0 0.25rem 0', fontWeight: '500' }}>
                                {order.customerFirstName} {order.customerLastName}
                            </p>
                            <p style={{ color: '#6B7280', margin: 0 }}>{order.deliveryAddress}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto', paddingTop: '1.5rem' }}>
                            {isPickedUp ? (
                                <button
                                    style={{ ...primaryButtonStyle, backgroundColor: '#2E7D32' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#256627'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2E7D32'}
                                >
                                    <FiCheckCircle /> Mark as Delivered
                                </button>
                            ) : (
                                <button
                                    onClick={handleMarkAsPickedUp}
                                    style={{ ...primaryButtonStyle, backgroundColor: '#1F2937' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#111827'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1F2937'}
                                >
                                    <FiNavigation /> Mark as Picked Up
                                </button>
                            )}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={handleReportDelay}
                                    style={secondaryButtonStyle}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#a1a618ff'; e.currentTarget.style.backgroundColor = '#fffeeeff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#a5a83eff'; e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#7a7d21ff'; }}
                                >
                                    <FiAlertTriangle size={14} /> Report Delay
                                </button>
                                <button
                                    onClick={handleCancelDelivery}
                                    style={secondaryButtonStyle}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#a5a83eff'; e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#7a7d21ff'; }}
                                >
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