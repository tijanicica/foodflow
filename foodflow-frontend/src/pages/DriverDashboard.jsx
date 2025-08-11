// FAJL: src/pages/DriverDashboard.jsx

import React, { useState, useEffect } from 'react';
import { getDriverDashboard, acceptOffer, rejectOffer } from '@/services/api';
import { MapComponent } from '../components/MapComponent';
import { NavbarDriver } from '../components/NavbarDriver'; // <-- UVEZLI SMO NAVBAR

/**
 * Komponenta za prikaz jedne kartice sa ponudom.
 */
const OfferCard = ({ offer, onAccept, onReject }) => (
    <div style={{
        backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #EAEAEA',
        minWidth: '280px'
    }}>
        <p style={{ fontWeight: 'bold' }}>Pickup: {offer.order.restaurantName}</p>
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>From: {offer.order.restaurantAddress}</p>
        <p style={{marginTop: '0.5rem'}}>Deliver to: {offer.order.deliveryAddress}</p>
        <p style={{ marginTop: '0.5rem', color: '#6B7280' }}>Distance: {offer.order.distanceToRestaurant.toFixed(1)} km</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button onClick={() => onReject(offer.id)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #8A643B', color: '#8A643B', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: '600' }}>
                Reject
            </button>
            <button onClick={() => onAccept(offer.id)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', color: 'white', backgroundColor: '#8A643B', cursor: 'pointer', fontWeight: '600' }}>
                Accept
            </button>
        </div>
    </div>
);

/**
 * Komponenta za prikaz jedne prihvaćene porudžbine.
 */
const AssignedDeliveryCard = ({ delivery }) => {
    const isReadyForPickup = delivery.status === 'READY_FOR_PICKUP';
    let statusMessage = "Waiting for Restaurant...";
    if (isReadyForPickup) { statusMessage = "Order is Ready for Pickup!"; }
    else if (delivery.status === 'PICKED_UP') { statusMessage = "On your way to customer!"; }

    return (
        <div style={{
            backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #EAEAEA',
            minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
            <div>
                <p style={{ fontWeight: 'bold' }}>Pickup: {delivery.restaurantName}</p>
                <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>From: {delivery.restaurantAddress}</p>
                <p>Deliver to: {delivery.deliveryAddress}</p>
                {isReadyForPickup && <p style={{ marginTop: '0.75rem', fontWeight: '600', color: '#2F855A' }}>{statusMessage}</p>}
            </div>
            {isReadyForPickup ? (
                <button style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', border: 'none', color: 'white', backgroundColor: '#333', cursor: 'pointer', fontWeight: '600' }}>
                    View on Map & Start
                </button>
            ) : (
                <div style={{ marginTop: '1.5rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#F3EAD9', color: '#8A643B', textAlign: 'center', fontWeight: '600' }}>
                    {statusMessage}
                </div>
            )}
        </div>
    );
};


export function DriverDashboard() {
    const [dashboardData, setDashboardData] = useState({ newOffers: [], assignedDeliveries: [], driverCoordinates: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const data = await getDriverDashboard();
            setDashboardData(data);
        } catch (err) {
            setError('Could not load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(() => {
            getDriverDashboard().then(setDashboardData).catch(() => setError('Failed to refresh data.'));
        }, 15000);
        return () => clearInterval(intervalId);
    }, []);

    const handleAccept = async (offerId) => { try { await acceptOffer(offerId); fetchData(); } catch { alert('Failed to accept offer.'); } };
    const handleReject = async (offerId) => { try { await rejectOffer(offerId); fetchData(); } catch { alert('Failed to reject offer.'); } };

    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh', color: '#4A4A4A' }}>
            
            {/* KORISTIMO NOVU NAVBAR KOMPONENTU */}
            <NavbarDriver />

            <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <section>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>New Order Opportunities</h2>
                            {loading && <p>Loading...</p>}
                            {error && <p style={{ color: 'red' }}>{error}</p>}
                            {!loading && dashboardData.newOffers.length > 0 ? (
                                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                    {dashboardData.newOffers.map(offer => (
                                        <OfferCard key={offer.id} offer={offer} onAccept={handleAccept} onReject={handleReject} />
                                    ))}
                                </div>
                            ) : !loading && (
                                <div style={{ border: '2px dashed #D1D5DB', borderRadius: '8px', padding: '4rem 1rem', textAlign: 'center', color: '#6B7280' }}>
                                    <p>No new orders available.</p>
                                </div>
                            )}
                        </section>

                        <section>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>My Assigned Deliveries</h2>
                            {loading && <p>Loading...</p>}
                            {!loading && dashboardData.assignedDeliveries.length > 0 ? (
                                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                    {dashboardData.assignedDeliveries.map(delivery => (
                                        <AssignedDeliveryCard key={delivery.id} delivery={delivery} />
                                    ))}
                                </div>
                            ) : !loading && (
                                <p style={{ color: '#6B7280', paddingLeft: '0.5rem' }}>You have no active deliveries.</p>
                            )}
                        </section>
                    </div>

                    <div style={{ borderRadius: '8px', minHeight: '400px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
                        {loading ? (
                            <div style={{ backgroundColor: '#F3EAD9', height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p style={{ color: '#6B7280' }}>Loading Map...</p>
                            </div>
                        ) : (
                            <MapComponent 
                                driverLocation={dashboardData.driverCoordinates} 
                                assignedDeliveries={dashboardData.assignedDeliveries}
                                newOffers={dashboardData.newOffers}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}