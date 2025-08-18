// FAJL: src/pages/DriverDashboard.jsx

import React, { useState, useEffect } from 'react';
import { getDriverDashboard, acceptOffer,getDriverInfo, rejectOffer} from '../services/api';
import { MapComponent } from '../components/MapComponent';
import { NavbarDriver } from '../components/NavbarDriver';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FiMapPin, FiShoppingBag,FiUser, FiArchive, FiNavigation, FiCheckCircle, FiXCircle, FiArrowLeft, FiArrowRight, FiInbox } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
// === SISTEM DIZAJNA: Definišemo boje i stilove na jednom mestu za konzistentnost ===
const cardMaxWidth = '450px';
// === NOVI DIZAJN SISTEM (INSPIRISAN KORISNIČKOM STRANICOM) ===

const colors = {
    background: '#FFFBF5', // Topla, kremasta bež pozadina
    surface: '#FFFFFF',    // Površina kartica ostaje bela za kontrast
    primary: '#A17A4B',    // Zlatno-smeđa, boja naslova sa vaše slike
    primaryDark: '#8A643B',
    textPrimary: '#3D3D3D', // Malo mekša crna za tekst, prijatnija za oko
    textSecondary: '#7A7A7A',
    border: '#F0EBE3',     // Veoma suptilna, topla boja ivica
    success: '#28A745',
    successBg: '#EAF7EC',
    danger: '#DC3545',
    dangerBg: '#FDEDED',
    waiting: '#FFC107',
    waitingBg: '#FFF9E6',
};

const commonCardStyle = {
    backgroundColor: colors.surface,
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 10px 25px -5px rgba(161, 122, 75, 0.1), 0 5px 10px -6px rgba(161, 122, 75, 0.1)',
    // Smanjujemo padding unutar kartica
    padding: '1.25rem', 
    maxWidth: cardMaxWidth,
    margin: '0 auto',
    transition: 'box-shadow 0.3s ease',
    fontFamily: "'Inter', sans-serif",
};

const cardHoverStyle = {
    boxShadow: '0 15px 30px -8px rgba(161, 122, 75, 0.2), 0 8px 15px -10px rgba(161, 122, 75, 0.2)',
};

const typography = {
    fontFamily: "'Inter', sans-serif",
    h2: {
        // Smanjujemo naslove sekcija
        fontSize: '1.2rem', 
        fontWeight: '700',
        color: colors.primary,
        letterSpacing: '-0.5px',
        backgroundColor: colors.border,
        padding: '0.4rem 1.2rem',
        borderRadius: '10px',
        display: 'inline-block',
        marginBottom: '1.25rem',
    },
};

const OfferCard = ({ offer, onAccept, onReject }) => {
    if (!offer || !offer.order) return null;

    const Stat = ({ label, value }) => (
        <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 700, color: colors.primary }}>
                {value} <span style={{fontSize: '0.8rem', fontWeight: 500}}>km</span>
            </p>
        </div>
    );
    
    // Smanjujemo padding za kompaktniji izgled
    const compactCardStyle = { ...commonCardStyle, padding: '1.25rem' };

    return (
        <div 
            style={compactCardStyle}
            onMouseEnter={e => Object.assign(e.currentTarget.style, cardHoverStyle)}
            onMouseLeave={e => Object.assign(e.currentTarget.style, { boxShadow: commonCardStyle.boxShadow })}
        >
            <div style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: '0.8rem', marginBottom: '1.25rem' }}>
                <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: colors.textPrimary, lineHeight: '1.2' }}>{offer.order.restaurantName}</p>
            </div>
            
            <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                    <FiShoppingBag style={{ color: colors.primary, fontSize: '1.3rem', flexShrink: 0, marginTop: '4px' }} />
                    <div>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>PICKUP</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: colors.textPrimary, lineHeight: 1.5 }}>{offer.order.restaurantAddress}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <FiUser style={{ color: colors.primary, fontSize: '1.3rem', flexShrink: 0, marginTop: '4px' }} />
                    <div>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>DELIVER TO</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: colors.textPrimary, lineHeight: 1.5 }}>{offer.order.deliveryAddress}</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, padding: '0.6rem 0' }}>
                <Stat label="To Restaurant" value={offer.order.distanceDriverToRestaurant.toFixed(1)} />
                <Stat label="To Customer" value={offer.order.distanceDriverToCustomer.toFixed(1)} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                    onClick={() => onReject(offer.id)}
                    style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textSecondary, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.dangerBg; e.currentTarget.style.color = colors.danger; e.currentTarget.style.borderColor = colors.dangerBg; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.textSecondary; e.currentTarget.style.borderColor = colors.border; }}
                ><FiXCircle size={14}/> Reject</button>
                <button
                    onClick={() => onAccept(offer.id)}
                    style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', border: 'none', background: colors.primary, color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s', boxShadow: `0 4px 12px -5px ${colors.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.primaryDark}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = colors.primary}
                ><FiCheckCircle size={14}/> Accept Offer</button>
            </div>
        </div>
    );
};
const AssignedDeliveryCard = ({ delivery }) => {
    const isReadyForPickup = delivery.status === 'READY_FOR_PICKUP';
    const isPickedUp = delivery.status === 'PICKED_UP';

    const StatusBadge = () => { 
        let text, style;
        if (isReadyForPickup) { text = "Ready for Pickup"; style = { backgroundColor: colors.successBg, color: '#166534', fontWeight: 600 }; }
        else if (isPickedUp) { text = "On your way"; style = { backgroundColor: '#EBF4FF', color: '#3B82F6', fontWeight: 600 }; }
        else { text = "Waiting"; style = { backgroundColor: colors.waitingBg, color: '#B45309', fontWeight: 500 }; }
        return <div style={{display:'inline-block', padding:'0.3rem 0.7rem', borderRadius:'7px', fontSize:'0.75rem', letterSpacing:'0.5px', textTransform:'uppercase', ...style}}>{text}</div>;
    };

    const compactCardStyle = { ...commonCardStyle, padding: '1.25rem' };

    return (
        <div 
            style={compactCardStyle}
            onMouseEnter={e => Object.assign(e.currentTarget.style, cardHoverStyle)}
            onMouseLeave={e => Object.assign(e.currentTarget.style, { boxShadow: commonCardStyle.boxShadow })}
        >
            <div style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: '0.8rem', marginBottom: '1.25rem' }}>
                <StatusBadge />
                <p style={{ margin: '0.6rem 0 0 0', fontSize: '1.4rem', fontWeight: 700, color: colors.textPrimary, lineHeight: '1.2' }}>{delivery.restaurantName}</p>
            </div>
            
            <div style={{ marginBottom: '1.25rem' }}>
                 <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                    <FiShoppingBag style={{ color: colors.primary, fontSize: '1.3rem', flexShrink: 0, marginTop: '4px' }} />
                    <div>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>PICKUP</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: colors.textPrimary, lineHeight: 1.5 }}>{delivery.restaurantAddress}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <FiUser style={{ color: colors.primary, fontSize: '1.3rem', flexShrink: 0, marginTop: '4px' }} />
                    <div>
                         <p style={{ margin: 0, fontSize: '0.7rem', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>DELIVER TO</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: colors.textPrimary, lineHeight: 1.5 }}>{delivery.deliveryAddress}</p>
                    </div>
                </div>
            </div>

            <div style={{ background: '#FAFAF8', borderRadius: '10px', padding: '0.8rem', textAlign: 'center' }}>
                 <p style={{ margin: 0, fontSize: '0.75rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {isPickedUp ? 'Distance to Customer' : 'Distance to Restaurant'}
                 </p>
                 <p style={{ margin: '4px 0 0 0', fontSize: '1.6rem', fontWeight: 700, color: colors.textPrimary }}>
                    {isPickedUp ? delivery.distanceDriverToCustomer.toFixed(1) : delivery.distanceDriverToRestaurant.toFixed(1)}
                    <span style={{fontSize: '0.9rem', fontWeight: 500}}> km</span>
                 </p>
            </div>
            
            {isReadyForPickup && (
                <div style={{ marginTop: '1.25rem' }}>
                    <Link to={`/driver/orders/${delivery.id}`} style={{ textDecoration: 'none' }}>
                        <button style={{
                            width: '100%', padding: '0.9rem', borderRadius: '10px', border: 'none', color: 'white',
                            background: '#1F2937', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem',
                            transition: 'all 0.2s ease', boxShadow: '0 8px 15px -5px rgba(31, 41, 55, 0.3)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 18px -5px rgba(31, 41, 55, 0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 15px -5px rgba(31, 41, 55, 0.3)'; }}
                        >
                            Start Delivery <FiArrowRight size={16}/>
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
};
const EmptyState = ({ message, details }) => (
    <div style={{
        backgroundColor: '#FAFAF8',
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        maxWidth: '440px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px', // Smanjena visina
    }}>
        <div style={{
            width: '70px', // Smanjen krug
            height: '70px',
            borderRadius: '50%',
            backgroundColor: colors.surface,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem', // Smanjen razmak
            border: `1px solid ${colors.border}`
        }}>
            <FiInbox size={36} style={{ color: colors.primary }} />
        </div>
        
        <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: colors.textPrimary }}>{message}</p>
        
        <p style={{ marginTop: '0.5rem', lineHeight: 1.6, color: colors.textSecondary, maxWidth: '300px' }}>{details}</p>
    </div>
);
// === FINALNI, PRELEPI CAROUSEL ===

// 1. Definicija stila za elegantne strelice
const navButtonStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    
    // Dizajn usklađen sa brendom
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    cursor: 'pointer',
    color: colors.primary, // Ikonica u boji brenda
    
    // Fina senka za "3D" efekat
    boxShadow: '0 8px 15px -5px rgba(161, 122, 75, 0.15)',
    
    // Centriranje ikonice
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    
    // Prefinjena tranzicija
    transition: 'all 0.2s ease-out',
    zIndex: 10,
};

// 2. Prefinjeni hover efekat za strelice
const navButtonHoverStyle = {
    transform: 'translateY(-50%) scale(1.1)', // Blago povećanje
    boxShadow: '0 10px 20px -5px rgba(161, 122, 75, 0.25)', // Jača senka
    backgroundColor: colors.primary, // Pozadina menja boju
    color: colors.surface, // Ikonica postaje bela
};


// Zamenite sa ovim:
const slideVariants = {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    // NOVO: Kartica sada elegantno klizi nadole i nestaje
    exit: { opacity: 0, scale: 0.95, y: 30 }
};

// 4. Glavna "wrapper" komponenta za logiku karusela
const CarouselWrapper = ({ children, items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Resetuje index kada se promeni niz stavki (npr. kad se prihvati ponuda)
    useEffect(() => { setCurrentIndex(0); }, [items]);

    const goPrev = () => setCurrentIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
    const goNext = () => setCurrentIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));

    // Ključna promena: `overflow: 'hidden'` na roditelju sprečava da strelice budu odsečene
    return (
        <div style={{ position: 'relative', maxWidth: cardMaxWidth, margin: '0 auto' }}>
            {items.length > 1 && (
                <>
                    {/* Leva strelica */}
                    <button 
                        onClick={goPrev} 
                        style={{ ...navButtonStyle, left: '-24px' }} 
                        onMouseEnter={e => Object.assign(e.currentTarget.style, navButtonHoverStyle)} 
                        onMouseLeave={e => Object.assign(e.currentTarget.style, navButtonStyle, {left: '-24px'})}
                    >
                        <FiArrowLeft size={24} />
                    </button>
                    {/* Desna strelica */}
                    <button 
                        onClick={goNext} 
                        style={{ ...navButtonStyle, right: '-24px' }} 
                        onMouseEnter={e => Object.assign(e.currentTarget.style, navButtonHoverStyle)} 
                        onMouseLeave={e => Object.assign(e.currentTarget.style, navButtonStyle, {right: '-24px'})}
                    >
                        <FiArrowRight size={24} />
                    </button>
                </>
            )}
            
            {/* Animacija prelaza */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex} // Animacija se aktivira na promenu ovog ključa
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                

                    transition={{
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
        y: { duration: 0.2, ease: "easeIn" } // Brzi pad
    }}
                >
                    {children(items[currentIndex])}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// 5. Finalne komponente koje koriste CarouselWrapper
const OfferCarousel = ({ offers, onAccept, onReject }) => {
    if (offers.length === 0) {
        return <EmptyState message="No new orders available" details="You will be notified when a new opportunity arises." />;
    }
    return (
        <CarouselWrapper items={offers}>
            {(offer) => <OfferCard offer={offer} onAccept={onAccept} onReject={onReject} />}
        </CarouselWrapper>
    );
};

const AssignedDeliveryCarousel = ({ deliveries }) => {
    if (deliveries.length === 0) {
        return <EmptyState message="You have no active deliveries" details="Accepted orders will appear here. Good luck!" />;
    }
    return (
        <CarouselWrapper items={deliveries}>
            {(delivery) => <AssignedDeliveryCard delivery={delivery} />}
        </CarouselWrapper>
    );
};
// --- FINALNA, SAVRŠENA I RESPONZIVNA GLAVNA KOMPONENTA ---
export function DriverDashboard() {
    // --- DIZAJN SISTEM ---
    const colors = {
        background: '#FFFBF5',
        surface: '#FFFFFF',
        primary: '#A17A4B',
        primaryDark: '#8A643B',
        textPrimary: '#3D3D3D',
        textSecondary: '#7A7A7A',
        border: '#F0EBE3',
        success: '#166534',
        successBg: '#EAF7EC',
        danger: '#DC3545',
        dangerBg: '#FDEDED',
        waitingBg: '#FFF9E6',
    };
    
    const typography = {
        fontFamily: "'Inter', sans-serif",
        h2: {
            fontSize: '1.4rem',
            fontWeight: '700',
            color: colors.primary,
            letterSpacing: '-0.5px',
            backgroundColor: colors.border,
            padding: '0.5rem 1.5rem',
            borderRadius: '12px',
            display: 'inline-block',
            marginBottom: '1.5rem',
        },
    };

    // --- STANJA (STATE) ---
    const [dashboardData, setDashboardData] = useState({ newOffers: [], assignedDeliveries: [], driverCoordinates: null });
    const [loading, setLoading] = useState(true);
    const [vehicleType, setVehicleType] = useState(null);
    const [error, setError] = useState('');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // --- LOGIKA (NEPROMENJENA) ---
    const fetchDashboardUpdates = async () => {
        try {
            const data = await getDriverDashboard();
            setDashboardData(data);
        } catch (err) {
            console.error('Failed to refresh dashboard data:', err);
        }
    };
    
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [dashboardResult, driverInfoResult] = await Promise.all([ getDriverDashboard(), getDriverInfo() ]);
                setDashboardData(dashboardResult);
                setVehicleType(driverInfoResult.vehicleType);
            } catch (err) {
                setError('Could not load crucial dashboard data. Please try refreshing the page.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
        const intervalId = setInterval(fetchDashboardUpdates, 15000);
        const handleRefresh = () => fetchDashboardUpdates();
        window.addEventListener('new-notification', handleRefresh);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('new-notification', handleRefresh);
        };
    }, []);
    
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const handleAccept = async (offerId) => {
        try {
            await acceptOffer(offerId);
            toast.success('Offer accepted successfully!');
            fetchDashboardUpdates();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept offer.');
        }
    };
    
    const handleReject = (offerId) => {
        const performReject = async (reason) => {
            if (!reason || reason.trim() === '') {
                toast.error('Please provide a reason for rejection.');
                return;
            }
            try {
                toast.loading('Rejecting offer...', { id: 'reject-toast' });
                await rejectOffer(offerId, reason);
                toast.success('Offer rejected.', { id: 'reject-toast' });
                fetchDashboardUpdates();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to reject offer.', { id: 'reject-toast' });
            }
        };
        
        toast.custom((t) => (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    fontFamily: typography.fontFamily,
                    width: '350px',
                    padding: '1.5rem',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    border: `1px solid ${colors.border}`,
                }}
            >
                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '1.2rem', color: colors.textPrimary }}>Reason for Rejection</h4>
                <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: colors.textSecondary }}>Why are you rejecting this offer?</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {['Too far', 'Too busy', 'Vehicle issue'].map(reason => (
                        <button
                            key={reason}
                            style={{ padding: '0.5rem 1rem', borderRadius: '99px', border: `1px solid ${colors.border}`, backgroundColor: '#F9FAFB', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                            onClick={() => { performReject(reason); toast.dismiss(t.id); }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.backgroundColor = '#FEFBF6'; e.currentTarget.style.color = colors.primary; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.backgroundColor = '#F9FAFB'; e.currentTarget.style.color = 'inherit'; }}
                        >{reason}</button>
                    ))}
                </div>
                <textarea id={`rejection-reason-${t.id}`} placeholder="Or provide a custom reason..."
                    style={{ width: '100%', minHeight: '80px', border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '0.75rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '0.9rem' }}
                />
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button onClick={() => toast.dismiss(t.id)}
                        style={{ padding: '0.6rem 1.2rem', border: `1px solid ${colors.border}`, borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontWeight: '600', color: colors.textSecondary }}>Cancel</button>
                    <button onClick={() => {
                        const reasonInput = document.getElementById(`rejection-reason-${t.id}`);
                        performReject(reasonInput.value);
                        toast.dismiss(t.id);
                    }}
                        style={{ padding: '0.6rem 1.2rem', border: 'none', borderRadius: '8px', background: colors.primary, color: 'white', cursor: 'pointer', fontWeight: '600' }}>Submit</button>
                </div>
            </motion.div>
        ), { duration: Infinity, position: 'top-center' });
    };

    // --- POMOĆNE KOMPONENTE ZA UI ---
    const SkeletonCard = () => (
        <div style={{...commonCardStyle, height: '350px', backgroundColor: '#FDFBF9', border: `1px solid ${colors.border}`}}>
            <div style={{ height: '100%', width: '100%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', backgroundColor: '#F3F4F6', borderRadius: '12px' }}></div>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }`}</style>
        </div>
    );
    const ErrorDisplay = ({ message }) => (
        <div style={{ border: `1px solid ${colors.dangerBg}`, borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: colors.danger, backgroundColor: colors.dangerBg }}>
            <p style={{ margin: 0, fontWeight: 600 }}>Oops! Something went wrong.</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>{message}</p>
        </div>
    );

    // --- RESPONZIVNI RASPORED ---
    const breakpoint = 1400;
    const isMobileLayout = windowWidth < breakpoint;
    const mainGridStyle = {
        display: 'grid',
        gridTemplateColumns: isMobileLayout ? '1fr' : 'minmax(450px, 1.2fr) 2fr',
        gap: '3rem',
    };

    const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2 // Malo kašnjenje između pojavljivanja panela
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};
    
    // --- GLAVNI RETURN BLOK ---
    return (
        <div style={{ fontFamily: typography.fontFamily, backgroundColor: colors.background, minHeight: '100vh', color: colors.textPrimary }}>
            <Toaster />
            <NavbarDriver />
            
            <main style={{ maxWidth: '1600px', margin: '0 auto', padding: isMobileLayout ? '2rem' : '3rem 5%' }}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={mainGridStyle} 
                >
                    {/* Leva Kolona */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        <section  style={{ textAlign: 'center' }}>
                            <h2 style={typography.h2}>New Order Opportunities</h2>
                            {loading ? <SkeletonCard /> : error ? <ErrorDisplay message={error} /> :
                                <OfferCarousel offers={dashboardData.newOffers} onAccept={handleAccept} onReject={handleReject} />
                            }
                        </section>
                        <section  style={{ textAlign: 'center' }}>
                            <h2 style={typography.h2}>My Assigned Deliveries</h2>
                            {loading ? <SkeletonCard /> : error ? <ErrorDisplay message={error} /> :
                                <AssignedDeliveryCarousel deliveries={dashboardData.assignedDeliveries} />
                            }
                        </section>
                    </div>
                    
                    {/* Desna Kolona - Mapa */}
                    <div style={{
                        borderRadius: '24px',
                        minHeight: isMobileLayout ? '500px' : '700px',
                        height: '100%',
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundColor: '#E5E7EB',
                        border: `1px solid ${colors.border}`,
                        boxShadow: '0 20px 35px -10px rgba(161, 122, 75, 0.15), 0 8px 15px -8px rgba(161, 122, 75, 0.15)',
                    }}>
                        {loading ? (
                            <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: colors.textSecondary }}>
                                <FiMapPin size={40} />
                                <p style={{ fontWeight: 600 }}>Initializing Map...</p>
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
                </motion.div>
            </main>
        </div>
    );
}