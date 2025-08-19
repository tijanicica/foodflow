// FAJL: src/pages/DriverDashboard.jsx

import React, { useState, useEffect } from 'react';
import { getDriverDashboard, acceptOffer,getDriverInfo, rejectOffer} from '../services/api';
import { MapComponent } from '../components/MapComponent';
import { NavbarDriver } from '../components/NavbarDriver';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

/**
 * Komponenta za prikaz jedne kartice sa ponudom.
 */
/**
 * Komponenta za prikaz jedne kartice sa ponudom.
 */
// FAJL: src/pages/DriverDashboard.jsx

// Definiramo zajedničku širinu kao varijablu na vrhu
const cardMaxWidth = '450px'; // Možete lako promijeniti ovu vrijednost (npr. '400px')


import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';



// Novi stil za strelice - veće, bez okvira, sa hover efektom
const navButtonStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    cursor: 'pointer',
    color: '#333',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'background-color 0.2s ease, color 0.2s ease', // Tranzicija za hover
    zIndex: 10,
};

// Nova, suptilnija animacija (cross-fade & scale)
const slideVariants = {
    initial: {
        opacity: 0,
        scale: 0.95, // Počinje malo manji
        zIndex: 1,
    },
    animate: {
        opacity: 1,
        scale: 1,
        zIndex: 1,
    },
    exit: {
        opacity: 0,
        scale: 1.05, // Odlazi malo veći
        zIndex: 0,
    }
};

// FAJL: src/pages/DriverDashboard.jsx

/**
 * Komponenta za prikaz jedne kartice sa ponudom.
 * UVIJEK PRIKAZUJE OBJE DISTANCE.
 */
const OfferCard = ({ offer, onAccept, onReject }) => {
        if (!offer || !offer.order) {
        return null; // Ili neki fallback prikaz
    }
    // Definiramo stilove kao objekte da bi kod bio čitljiviji
    const baseButtonStyle = {
        flex: 1,
        padding: '0.75rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.2s ease-in-out'
    };
    const rejectButtonStyle = { ...baseButtonStyle, border: '2px solid #D1D5DB', color: '#4A4A4A', backgroundColor: 'transparent' };
    const acceptButtonStyle = { ...baseButtonStyle, border: '2px solid #8A643B', color: 'white', backgroundColor: '#8A643B' };

    return (
        <div style={{
            backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #EAEAEA',
            transition: 'transform 0.2s ease-in-out',
            maxWidth: cardMaxWidth,
            margin: '0 auto'
        }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>Pickup: {offer.order.restaurantName}</p>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>From: {offer.order.restaurantAddress}</p>
            <p style={{ marginTop: '0.75rem' }}>Deliver to: {offer.order.deliveryAddress}</p>
            
            {/* Prikaz obje distance */}
            <div style={{ marginTop: '1rem', color: '#333', fontSize: '0.9rem', borderTop: '1px solid #F0F0F0', paddingTop: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}>
                    Distance to Restaurant: <strong>{offer.order.distanceDriverToRestaurant.toFixed(1)} km</strong>
                </p>
                <p style={{ margin: 0 }}>
                    Distance to Customer: <strong>{offer.order.distanceDriverToCustomer.toFixed(1)} km</strong>
                </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                    onClick={() => onReject(offer.id)}
                    style={rejectButtonStyle}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#4A4A4A'; }}
                >
                    Reject
                </button>
                <button
                    onClick={() => onAccept(offer.id)}
                    style={acceptButtonStyle}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#71502f'}
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
 * DINAMIČKI PRIKAZUJE DISTANCU.
 */
const AssignedDeliveryCard = ({ delivery }) => {
    const isReadyForPickup = delivery.status === 'READY_FOR_PICKUP';
    const isPickedUp = delivery.status === 'PICKED_UP';
    let statusMessage = "Waiting for Restaurant...";
    if (isReadyForPickup) { statusMessage = "Order is Ready for Pickup!"; }
    else if (isPickedUp) { statusMessage = "On your way to customer!"; }

    return (
        <div style={{
            backgroundColor: 'white', 
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
            border: '1px solid #EAEAEA',
            maxWidth: cardMaxWidth,
            margin: '0 auto'
        }}>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>Pickup: {delivery.restaurantName}</p>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>From: {delivery.restaurantAddress}</p>
            <p style={{ marginTop: '0.5rem' }}>Deliver to: {delivery.deliveryAddress}</p>
            
            {/* === VRAĆENA IF/ELSE LOGIKA ZA DISTANCU === */}
            <div style={{ marginTop: '1rem', color: '#333', fontSize: '0.9rem', borderTop: '1px solid #F0F0F0', paddingTop: '1rem' }}>
                {isPickedUp ? (
                    // Ako je preuzeo, prikaži distancu do kupca
                    <p style={{ margin: 0, fontWeight: 'bold' }}>
                        Distance to Customer: {delivery.distanceDriverToCustomer.toFixed(1)} km
                    </p>
                ) : (
                    // Ako nije preuzeo, prikaži distancu do restorana
                    <p style={{ margin: 0, fontWeight: 'bold' }}>
                        Distance to Restaurant: {delivery.distanceDriverToRestaurant.toFixed(1)} km
                    </p>
                )}
            </div>
            
            {/* Donji dio sa statusom i gumbom */}
            {isReadyForPickup ? (
                <>
                           <p style={{ margin: '1rem 0', padding: '0.5rem 0', color: '#2F855A', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#EBF8F2', borderRadius: '8px' }}>{statusMessage}</p>
                        {/* === 2. OMOTAJTE DUGME SA <Link> === */}
                        <Link to={`/driver/orders/${delivery.id}`} style={{ textDecoration: 'none' }}>
                            <button style={{
                                width: '100%', padding: '0.8rem', borderRadius: '8px',
                                border: 'none', color: 'white', backgroundColor: '#1F2937',
                                cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'
                            }}>
                                View on Map & Start
                            </button>
                        </Link>
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
        padding: '3rem 1.2rem', // <-- PROMIJENILI SMO PADDING DA BUDE USKLAĐEN
        textAlign: 'center', 
        color: '#6B7280',
        backgroundColor: '#FDFDF5',
        maxWidth: '440px', // Koristimo zajedničku širinu
        margin: '0 6px',
        // Da bi bio iste visine kao kartice, možemo dodati minHeight
        boxSizing: 'border-box' // Važno da padding bude uračunat u širinu/visinu
    }}>
        <p style={{ fontSize: '1.1rem', fontWeight: '500', margin: 0 }}>{message}</p>
        <p style={{ marginTop: '0.5rem' }}>{details}</p>
    </div>
);

const OfferCarousel = ({ offers, onAccept, onReject }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => { setCurrentIndex(0); }, [offers]);

    const goPrev = () => { setCurrentIndex(prev => (prev > 0 ? prev - 1 : offers.length - 1)); };
    const goNext = () => { setCurrentIndex(prev => (prev < offers.length - 1 ? prev + 1 : 0)); };

    if (offers.length === 0) {
        return <EmptyState message="No new orders available." details="You will be notified..." />;
    }

    return (
        <div style={{ position: 'relative', maxWidth: cardMaxWidth, margin: '0px 0px', minHeight: '220px' /* Visina da spriječimo skakanje */ }}>
            {offers.length > 1 && (
                <>
                    <button onClick={goPrev} style={{ ...navButtonStyle, left: '-35px' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#000'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#333'; }}>
                        <FiArrowLeft size={32} />
                    </button>
                    <button onClick={goNext} style={{ ...navButtonStyle, right: '-35px' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#000'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#333'; }}>
                        <FiArrowRight size={32} />
                    </button>
                </>
            )}
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex} // Animacija se pokreće kada se ovaj key promijeni
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                    <OfferCard offer={offers[currentIndex]} onAccept={onAccept} onReject={onReject} />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const AssignedDeliveryCarousel = ({ deliveries }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => { setCurrentIndex(0); }, [deliveries]);

    const goPrev = () => { setCurrentIndex(prev => (prev > 0 ? prev - 1 : deliveries.length - 1)); };
    const goNext = () => { setCurrentIndex(prev => (prev < deliveries.length - 1 ? prev + 1 : 0)); };

    if (deliveries.length === 0) {
        return <EmptyState message="You have no active deliveries." details="Accepted orders will appear here." />;
    }

    return (
        <div style={{ position: 'relative', maxWidth: cardMaxWidth, margin: '0 0', minHeight: '220px' }}>
            {deliveries.length > 1 && (
                <>
                    <button onClick={goPrev} style={{ ...navButtonStyle, left: '-36px' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#000'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#333'; }}>
                        <FiArrowLeft size={32} />
                    </button>
                    <button onClick={goNext} style={{ ...navButtonStyle, right: '-35px' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#000'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#333'; }}>
                        <FiArrowRight size={32} />
                    </button>
                </>
            )}
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                    <AssignedDeliveryCard delivery={deliveries[currentIndex]} />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};


// --- GLAVNA KOMPONENTA ---
export function DriverDashboard() {
    // --- STANJA (STATE) ---
    const [dashboardData, setDashboardData] = useState({ newOffers: [], assignedDeliveries: [], driverCoordinates: null });
    const [loading, setLoading] = useState(true);
    const [vehicleType, setVehicleType] = useState(null); 
    const [error, setError] = useState('');
    // Ne vidim da koristiš `isRejectModalOpen`, pa sam ga zakomentarisao, ali ga ostavljam ako ti treba za neku drugu logiku.
    // const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    // --- FUNKCIJE ZA DOBAVLJANJE PODATAKA ---
    // 1. Funkcija koja dobavlja SAMO podatke koji se često menjaju (porudžbine, lokacije)
    const fetchDashboardUpdates = async () => {
        try {
            const data = await getDriverDashboard();
            setDashboardData(data);
        } catch (err) {
            console.error('Failed to refresh dashboard data:', err);
        }
    };

    // 2. Glavni useEffect koji se poziva samo JEDNOM, prilikom prvog učitavanja komponente.
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [dashboardResult, driverInfoResult] = await Promise.all([
                    getDriverDashboard(),
                    getDriverInfo()
                ]);
                setDashboardData(dashboardResult);
                setVehicleType(driverInfoResult.vehicleType);
            } catch (err) {
                setError('Could not load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
        const intervalId = setInterval(fetchDashboardUpdates, 15000);
        return () => clearInterval(intervalId);
    }, []);


    // --- FUNKCIJE ZA UPRAVLJANJE PONUDAMA (HANDLERS) ---
    // 3. handleAccept sada poziva funkciju za osvežavanje
    const handleAccept = async (offerId) => {
        try {
            await acceptOffer(offerId);
            toast.success('Offer accepted!');
            fetchDashboardUpdates();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept offer.');
        }
    };

    useEffect(() => {
    const handleRefresh = (event) => {
      console.log("Dashboard received refresh signal!", event.detail);
      fetchDashboardUpdates(); // Pozovi funkciju za osvežavanje
    };

    window.addEventListener('new-notification', handleRefresh);

    return () => {
      window.removeEventListener('new-notification', handleRefresh);
    };
  }, []);

    // 4. handleReject sa svom tvojom logikom za modal
    const handleReject = (offerId) => {
        const performReject = async (reason) => {
            try {
                toast.loading('Rejecting offer...', { id: 'rejecting-toast' });
                await rejectOffer(offerId, reason);
                toast.dismiss('rejecting-toast');
                toast.success('Offer rejected successfully.');
                fetchDashboardUpdates();
            } catch (err) {
                toast.dismiss('rejecting-toast');
                toast.error(err.response?.data?.message || 'Failed to reject offer.');
            }
            // `finally` blok sa `setIsRejectModalOpen(false)` nije potreban jer se modal zatvara preko `toast.dismiss(t.id)`
        };
        
        toast((t) => {
            const predefinedReasonStyle = {
                padding: '0.5rem 1rem', borderRadius: '16px', border: '1px solid #D1D5DB',
                backgroundColor: '#F9FAFB', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s ease',
            };

            return (
                 <div style={{ fontFamily: 'sans-serif', width: '300px', padding: '1.5rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #EAEAEA' }}>
                    <h4 style={{ margin: '0 0 1.5rem 0', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        Reason for Rejection
                    </h4>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#6B7280' }}>
                        Select a common reason or write your own:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {['Too far', 'Too busy', 'Vehicle issue'].map(reason => (
                            <button key={reason} style={predefinedReasonStyle}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                onClick={() => {
                                    performReject(reason);
                                    toast.dismiss(t.id);
                                }}>
                                {reason}
                            </button>
                        ))}
                    </div>
                    <textarea id={`rejection-reason-${t.id}`} placeholder="Or write a custom reason here..."
                        style={{ width: '100%', minHeight: '80px', border: '1px solid #ccc', borderRadius: '8px', padding: '0.75rem', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button onClick={() => toast.dismiss(t.id)}
                            style={{ padding: '0.6rem 1.2rem', border: '1px solid #ccc', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontWeight: '600' }}>
                            Cancel
                        </button>
                        <button onClick={() => {
                                const reasonInput = document.getElementById(`rejection-reason-${t.id}`);
                                performReject(reasonInput.value);
                                toast.dismiss(t.id);
                            }}
                            style={{ padding: '0.6rem 1.2rem', border: 'none', borderRadius: '8px', background: '#8A643B', color: 'white', cursor: 'pointer', fontWeight: '600' }}>
                            Submit
                        </button>
                    </div>
                </div>
            );
        }, { duration: Infinity, position: "top-center" });
    }; // <-- **OVO JE KRA_J `handleReject` FUNKCIJE**
    

    // --- GLAVNI RETURN BLOK KOMPONENTE ---
    // Sve definicije stanja i funkcija moraju biti IZNAD ove `return` naredbe.
    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh', color: '#4A4A4A' }}>
            <Toaster />
            <NavbarDriver />
            <main style={{ padding: '2rem 5%' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', backgroundColor: '#FDFDF5', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 35px rgba(210, 180, 140, 0.2)', border: '1px solid #F3EAD9' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '2.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            <section>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '2px solid #F3EAD9', paddingBottom: '0.75rem' }}>New Order Opportunities</h2>
                                {loading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>{error}</p> :
                                    <OfferCarousel
                                        offers={dashboardData.newOffers}
                                        onAccept={handleAccept}
                                        onReject={handleReject}
                                    />
                                }
                            </section>
                            <section>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '2px solid #F3EAD9', paddingBottom: '0.75rem' }}>My Assigned Deliveries</h2>
                                {loading ? <p>Loading...</p> :
                                    <AssignedDeliveryCarousel deliveries={dashboardData.assignedDeliveries} />
                                }
                            </section>
                        </div>
                        <div style={{ borderRadius: '16px', minHeight: '600px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', position: 'relative', border: '1px solid #F3EAD9' }}>
                            {loading ? (
                                <div style={{ backgroundColor: '#F3EAD9', height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <p style={{ color: '#6B7280' }}>Loading Map...</p>
                                </div>
                            ) : (
                                <MapComponent
                                    driverLocation={dashboardData.driverCoordinates}
                                    assignedDeliveries={dashboardData.assignedDeliveries}
                                    newOffers={dashboardData.newOffers}
                                    vehicleType={vehicleType}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 