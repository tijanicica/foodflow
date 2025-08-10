// FAJL: src/pages/DriverDashboard.jsx
// ZAMIJENITE CIJELI SADRŽAJ SA OVIM KODOM

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getDriverDashboard, acceptOffer, rejectOffer } from '@/services/api'; // Importujemo nove funkcije

/**
 * Komponenta za prikaz jedne kartice sa ponudom.
 */
const OfferCard = ({ offer, onAccept, onReject }) => (
    <div style={{
        backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #EAEAEA'
    }}>
        <p style={{ fontWeight: 'bold' }}>
            Pickup: {offer.order?.restaurantName || 'Unknown Restaurant'}
        </p>
        <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            {offer.order?.restaurantAddress || 'Unknown Restaurant Address'}
        </p>
        <p>
            Deliver to: {offer.order?.deliveryAddress || 'Unknown Address'}
        </p>
        <p style={{ marginTop: '0.5rem', color: '#6B7280' }}>
            Distance: {offer.order?.distanceToRestaurant
                ? `${offer.order.distanceToRestaurant.toFixed(2)} km`
                : 'N/A'}
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
                onClick={() => onReject(offer.id)}
                style={{
                    flex: 1, padding: '0.75rem', borderRadius: '8px',
                    border: '1px solid #8A643B', color: '#8A643B',
                    backgroundColor: 'transparent', cursor: 'pointer',
                    fontWeight: '600'
                }}
            >
                Reject
            </button>
            <button
                onClick={() => onAccept(offer.id)}
                style={{
                    flex: 1, padding: '0.75rem', borderRadius: '8px',
                    border: 'none', color: 'white', backgroundColor: '#8A643B',
                    cursor: 'pointer', fontWeight: '600'
                }}
            >
                Accept
            </button>
        </div>
    </div>
);



export function DriverDashboard() {
    const navigate = useNavigate();
    // Stanje za čuvanje podataka sa servera
    const [dashboardData, setDashboardData] = useState({ newOffers: [], assignedDeliveries: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Funkcija za dohvaćanje podataka sa servera
    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getDriverDashboard();
            setDashboardData(data);
        } catch (err) {
            setError('Could not load dashboard data. Please log in again.');
        } finally {
            setLoading(false);
        }
    };

    // Dohvaćamo podatke kada se komponenta prvi put učita
    useEffect(() => {
        fetchData();
        // Opcionalno: Automatsko osvježavanje svakih 30 sekundi
        const intervalId = setInterval(fetchData, 30000);
        return () => clearInterval(intervalId); // Čistimo interval
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        navigate('/login', { replace: true });
    };

    const handleAccept = async (offerId) => {
        try {
            await acceptOffer(offerId);
            alert('Offer accepted successfully!');
            fetchData(); // Ponovo dohvati podatke da se UI odmah ažurira
        } catch (err) {
            alert('Failed to accept offer. Please try again.');
        }
    };

    const handleReject = async (offerId) => {
        try {
            await rejectOffer(offerId);
            alert('Offer rejected.');
            fetchData(); // Ponovo dohvati podatke
        } catch (err) {
            alert('Failed to reject offer. Please try again.');
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh', color: '#4A4A4A' }}>
            {/* Navigacija */}
            <header style={{ backgroundColor: 'white', borderBottom: '1px solid #EAEAEA' }}>
                <nav style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>FoodFlow Driver</h1>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <Link to="/driver" style={{ fontWeight: '600', borderBottom: '2px solid #8A643B', textDecoration: 'none', color: '#4A4A4A' }}>Dashboard</Link>
                        <Link to="/driver/profile" style={{ textDecoration: 'none', color: '#4A4A4A' }}>My Profile</Link>
                        <button onClick={handleLogout} style={{ backgroundColor: '#8A643B', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
                    </div>
                </nav>
            </header>

            {/* Glavni Sadržaj */}
            <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                    {/* Lijeva Kolona */}
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>New Order Opportunities</h2>
                        
                        {/* DINAMIČKI PRIKAZ SADRŽAJA */}
                        {loading && <p>Loading offers...</p>}
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        
                        {!loading && dashboardData.newOffers.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {dashboardData.newOffers.map(offer => (
                                    <OfferCard key={offer.id} offer={offer} onAccept={handleAccept} onReject={handleReject} />
                                ))}
                            </div>
                        ) : !loading && (
                            <div style={{ border: '2px dashed #D1D5DB', borderRadius: '8px', padding: '4rem 1rem', textAlign: 'center', color: '#6B7280' }}>
                                <p>No new orders available.</p>
                            </div>
                        )}

                        {/* TODO: Kasnije ćemo ovdje dodati prikaz za 'assignedDeliveries' */}
                    </div>

                    {/* Desna Kolona - Mapa */}
                    <div style={{ backgroundColor: '#F3EAD9', borderRadius: '8px', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ color: '#6B7280' }}>Map View</p>
                    </div>
                </div>
            </main>
        </div>
    );
}