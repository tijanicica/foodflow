// FAJL: src/pages/DriverDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getDriverDashboard, acceptOffer, rejectOffer } from '@/services/api';

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
        <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            From: {offer.order.restaurantAddress}
        </p>
        <p>Deliver to: {offer.order.deliveryAddress}</p>
        <p style={{ marginTop: '0.5rem', color: '#6B7280' }}>
            Distance: {offer.order.distanceToRestaurant.toFixed(1)} km
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
                onClick={() => onReject(offer.id)}
                style={{
                    flex: 1, padding: '0.75rem', borderRadius: '8px',
                    border: '1px solid #8A643B', color: '#8A643B',
                    backgroundColor: 'transparent', cursor: 'pointer', fontWeight: '600'
                }}
            >
                Reject
            </button>
            <button
                onClick={() => onAccept(offer.id)}
                style={{
                    flex: 1, padding: '0.75rem', borderRadius: '8px',
                    border: 'none', color: 'white',
                    backgroundColor: '#8A643B', cursor: 'pointer', fontWeight: '600'
                }}
            >
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
    if (isReadyForPickup) {
        statusMessage = "Order is Ready for Pickup!";
    } else if (delivery.status === 'PICKED_UP') {
        statusMessage = "On your way to customer!";
    }

    return (
        <div style={{
            backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: isReadyForPickup ? '2px solid #2F855A' : '1px solid #EAEAEA',
            minWidth: '280px'
        }}>
            <p style={{ fontWeight: 'bold' }}>Pickup: {delivery.restaurantName}</p>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                From: {delivery.restaurantAddress}
            </p>
            <p>Deliver to: {delivery.deliveryAddress}</p>

            {isReadyForPickup ? (
                <>
                    <p style={{ marginTop: '1rem', color: '#2F855A', fontWeight: 'bold' }}>{statusMessage}</p>
                    <button style={{
                        width: '100%', marginTop: '1rem', padding: '0.75rem',
                        borderRadius: '8px', border: 'none', color: 'white',
                        backgroundColor: '#333', cursor: 'pointer', fontWeight: '600'
                    }}>
                        View on Map & Start
                    </button>
                </>
            ) : (
                <div style={{
                    marginTop: '1.5rem', padding: '0.75rem', borderRadius: '8px',
                    backgroundColor: '#F3EAD9', color: '#8A643B',
                    textAlign: 'center', fontWeight: '600'
                }}>
                    {statusMessage}
                </div>
            )}
        </div>
    );
};

export function DriverDashboard() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({ newOffers: [], assignedDeliveries: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const data = await getDriverDashboard();
            setDashboardData(data);
        } catch (err) {
            setError('Could not load dashboard data. Please log in again.');
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

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        navigate('/login', { replace: true });
    };

    const handleAccept = async (offerId) => {
        try {
            await acceptOffer(offerId);
            fetchData();
        } catch {
            alert('Failed to accept offer. Please try again.');
        }
    };

    const handleReject = async (offerId) => {
        try {
            await rejectOffer(offerId);
            fetchData();
        } catch {
            alert('Failed to reject offer. Please try again.');
        }
    };

    return (
        <div style={{
            fontFamily: 'sans-serif',
            backgroundColor: '#FFFBEB',
            minHeight: '100vh',
            color: '#4A4A4A'
        }}>
            <header style={{ backgroundColor: 'white', borderBottom: '1px solid #EAEAEA' }}>
                <nav style={{
                    maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>FoodFlow Driver</h1>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <Link to="/driver" style={{
                            fontWeight: '600', borderBottom: '2px solid #8A643B',
                            textDecoration: 'none', color: '#4A4A4A'
                        }}>Dashboard</Link>
                        <Link to="/driver/profile" style={{
                            textDecoration: 'none', color: '#4A4A4A'
                        }}>My Profile</Link>
                        <button onClick={handleLogout} style={{
                            backgroundColor: '#8A643B', border: 'none', color: 'white',
                            padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer'
                        }}>Logout</button>
                    </div>
                </nav>
            </header>

            <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                        {/* New Orders */}
                        <section>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>New Order Opportunities</h2>
                            {loading && <p>Loading...</p>}
                            {error && <p style={{ color: 'red' }}>{error}</p>}
                            {!loading && dashboardData.newOffers.length > 0 ? (
                                <div style={{
                                    display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem'
                                }}>
                                    {dashboardData.newOffers.map(offer => (
                                        <OfferCard key={offer.id} offer={offer} onAccept={handleAccept} onReject={handleReject} />
                                    ))}
                                </div>
                            ) : !loading && (
                                <div style={{
                                    border: '2px dashed #D1D5DB', borderRadius: '8px',
                                    padding: '4rem 1rem', textAlign: 'center', color: '#6B7280'
                                }}>
                                    <p>No new orders available.</p>
                                </div>
                            )}
                        </section>

                        {/* Assigned Deliveries */}
                        <section>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>My Assigned Deliveries</h2>
                            {loading && <p>Loading...</p>}
                            {!loading && dashboardData.assignedDeliveries.length > 0 ? (
                                <div style={{
                                    display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem'
                                }}>
                                    {dashboardData.assignedDeliveries.map(delivery => (
                                        <AssignedDeliveryCard key={delivery.id} delivery={delivery} />
                                    ))}
                                </div>
                            ) : !loading && (
                                <p style={{ color: '#6B7280', paddingLeft: '0.5rem' }}>You have no active deliveries.</p>
                            )}
                        </section>

                    </div>

                    {/* Map placeholder */}
                    <div style={{
                        backgroundColor: '#F3EAD9', borderRadius: '8px',
                        minHeight: '400px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <p style={{ color: '#6B7280' }}>Map View</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
