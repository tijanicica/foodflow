// FAJL: src/pages/DriverDashboard.jsx

import React, { useState, useEffect } from 'react';
import { getDriverDashboard, acceptOffer, rejectOffer } from '../services/api';
import { MapComponent } from '../components/MapComponent';
import { NavbarDriver } from '../components/NavbarDriver';

/**
 * Komponenta za prikaz jedne kartice sa ponudom.
 */
/**
 * Komponenta za prikaz jedne kartice sa ponudom.
 */
// FAJL: src/pages/DriverDashboard.jsx

// Definiramo zajedničku širinu kao varijablu na vrhu
const cardMaxWidth = '420px'; // Možete lako promijeniti ovu vrijednost (npr. '400px')

/**
 * Komponenta za prikaz jedne kartice sa ponudom.
 */
// FAJL: src/pages/DriverDashboard.jsx


// FAJL: src/pages/DriverDashboard.jsx

/**
 * Komponenta za prikaz jedne kartice sa ponudom, sa poboljšanim gumbovima.
 */
const OfferCard = ({ offer, onAccept, onReject }) => {
    // Definiramo stilove kao objekte da bi kod bio čitljiviji
    const baseButtonStyle = {
        flex: 1,
        padding: '0.75rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.2s ease-in-out' // Glatka tranzicija za sve promjene
    };

    const rejectButtonStyle = {
        ...baseButtonStyle,
        border: '2px solid #D1D5DB',
        color: '#4A4A4A',
        backgroundColor: 'transparent'
    };
    
    const acceptButtonStyle = {
        ...baseButtonStyle,
        border: '2px solid #8A643B', // Dodajemo ivicu radi konzistentnosti
        color: 'white',
        backgroundColor: '#8A643B'
    };

    return (
        <div style={{
            backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #EAEAEA',
            transition: 'transform 0.2s ease-in-out',
            maxWidth: cardMaxWidth,
            margin: '0 6px'
        }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>Pickup: {offer.order.restaurantName}</p>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>From: {offer.order.restaurantAddress}</p>
            <p style={{ marginTop: '0.75rem' }}>Deliver to: {offer.order.deliveryAddress}</p>
            <p style={{ marginTop: '0.75rem', color: '#333', fontWeight: '500' }}>Distance: {offer.order.distanceToRestaurant.toFixed(1)} km</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                    onClick={() => onReject(offer.id)}
                    style={rejectButtonStyle}
                    // Mijenjamo stil na hover
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#ffffffff'; // Blago crvena pozadina
                        e.currentTarget.style.borderColor = '#EF4444'; // Crvena ivica
                        e.currentTarget.style.color = '#da3d3dff'; // Crveni tekst
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = '#D1D5DB';
                        e.currentTarget.style.color = '#404040ff';
                    }}
                >
                    Reject
                </button>
                <button
                    onClick={() => onAccept(offer.id)}
                    style={acceptButtonStyle}
                    // Mijenjamo stil na hover
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#71502f'} // Tamnija nijansa
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8A643B'}
                >
                    Accept
                </button>
            </div>
        </div>
    );
};

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
            backgroundColor: 'white', 
            padding: '1.5rem', // Padding ostaje isti
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
            border: '1px solid #EAEAEA',
            maxWidth: cardMaxWidth, // Koristimo zajedničku širinu
            margin: '0 6px'
        }}>
            {/* Sadržaj ostaje isti */}
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>Pickup: {delivery.restaurantName}</p>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>From: {delivery.restaurantAddress}</p>
            <p style={{ marginTop: '0.5rem' }}>Deliver to: {delivery.deliveryAddress}</p>
            
            {isReadyForPickup ? (
                <>
                    <p style={{ marginTop: '1rem', padding: '0.5rem 0', color: '#2F855A', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#EBF8F2', borderRadius: '8px' }}>{statusMessage}</p>
                    <button style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', border: 'none', color: 'white', backgroundColor: '#1F2937', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                        View on Map & Start
                    </button>
                </>
            ) : (
                <div style={{ marginTop: '1.5rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#F3EAD9', color: '#8A643B', textAlign: 'center', fontWeight: '600' }}>
                    {statusMessage}
                </div>
            )}
        </div>
    );
};

/**
 * Komponenta za elegantan prikaz praznog stanja.
 */
const EmptyState = ({ message, details }) => (
    <div style={{
        border: '2px dashed #D1D5DB', 
        borderRadius: '12px',
        padding: '3rem 1.5rem', // <-- PROMIJENILI SMO PADDING DA BUDE USKLAĐEN
        textAlign: 'center', 
        color: '#6B7280',
        backgroundColor: '#FDFDF5',
        maxWidth: cardMaxWidth, // Koristimo zajedničku širinu
        margin: '0 auto',
        // Da bi bio iste visine kao kartice, možemo dodati minHeight
        boxSizing: 'border-box' // Važno da padding bude uračunat u širinu/visinu
    }}>
        <p style={{ fontSize: '1.1rem', fontWeight: '500', margin: 0 }}>{message}</p>
        <p style={{ marginTop: '0.5rem' }}>{details}</p>
    </div>
);


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

    const handleAccept = async (offerId) => {
        try {
            await acceptOffer(offerId);
            fetchData();
        } catch (err) {
            alert('Failed to accept offer.');
        }
    };

    const handleReject = async (offerId) => {
        try {
            await rejectOffer(offerId);
            fetchData();
        } catch (err) {
            alert('Failed to reject offer.');
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh', color: '#4A4A4A' }}>
            <NavbarDriver />

            <main style={{ padding: '2rem 6rem' }}>
                <div style={{
                    maxWidth: '1400px', margin: '0 auto',
                    backgroundColor: '#FDFDF5', // Svijetla krem boja za podkontejner
                    borderRadius: '24px',
                    padding: '2.5rem', 
                    boxShadow: '0 10px 35px rgba(210, 180, 140, 0.2)', // Topla sjenka
                    border: '1px solid #F3EAD9'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '2.5rem' }}>
                        {/* LIJEVA KOLONA */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            <section>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '2px solid #F3EAD9', paddingBottom: '0.75rem' }}>New Order Opportunities</h2>
                                {loading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>{error}</p> :
                                    dashboardData.newOffers.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                            {dashboardData.newOffers.map(offer => (
                                                <OfferCard key={offer.id} offer={offer} onAccept={handleAccept} onReject={handleReject} />
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState message="No new orders available." details="You will be notified when a new opportunity appears." />
                                    )}
                            </section>

                            <section>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '2px solid #F3EAD9', paddingBottom: '0.75rem' }}>My Assigned Deliveries</h2>
                                {loading ? <p>Loading...</p> :
                                    dashboardData.assignedDeliveries.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                            {dashboardData.assignedDeliveries.map(delivery => (
                                                <AssignedDeliveryCard key={delivery.id} delivery={delivery} />
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState message="You have no active deliveries." details="Accepted orders will appear here." />
                                    )}
                            </section>
                        </div>

                        {/* DESNA KOLONA (MAPA) */}
                        <div style={{ borderRadius: '16px', minHeight: '400px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', position: 'relative', border: '1px solid #F3EAD9' }}>
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
                </div>
            </main>
        </div>
    );
}