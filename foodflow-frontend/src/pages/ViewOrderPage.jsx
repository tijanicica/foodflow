// FAJL: src/pages/ViewOrderPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { NavbarDriver } from '../components/NavbarDriver';
import { MapComponent } from '../components/MapComponent';
import { getOrderDetails, cancelDelivery,startSimulation,markOrderAsPickedUp , getDriverInfo } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import {
  FiMapPin,
  FiUser,
  FiAlertTriangle,
  FiXCircle,
  FiCheckCircle,
  FiNavigation,
  FiClock,
  FiEdit3,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const predefinedReasons = [
    { id: 1, text: "Vehicle breakdown", icon: <FiAlertTriangle /> },
    { id: 2, text: "Traffic jam" },
 { id: 3, text: "Spilled order", icon: <FiXCircle /> },
    { id: 4, text: "Personal reasons", icon: <FiUser /> }
];

const CancelOrderModal = ({ onConfirm, onCancel }) => {
    const [selectedReasons, setSelectedReasons] = useState([]);
    const [customReason, setCustomReason] = useState("");

    const toggleReason = (id) => {
        setSelectedReasons((prev) =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handleConfirm = () => {
        // Uzimamo tekstove iz predefinisanih razloga
        const selectedTexts = predefinedReasons
            .filter(r => selectedReasons.includes(r.id))
            .map(r => r.text);

        // Ako postoji custom reason, dodaj ga
        if (customReason.trim()) {
            selectedTexts.push(customReason.trim());
        }

        // Ako nema ničega izabrano, obavesti korisnika
        if (selectedTexts.length === 0) {
            alert("Please select or enter at least one reason before confirming.");
            return;
        }

        // SPOJIMO niz u jedan string, odvojen zarezima
        const finalReason = selectedTexts.join(", ");

        // Pošaljemo samo jedan string backendu
        onConfirm(finalReason);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
                backgroundColor: '#FFFBEB',
                borderRadius: '20px',
                padding: '2.5rem',
                width: '550px',
                boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
                border: '1px solid #F3EAD9'
            }}
        >
            <h3 style={{ margin: '0 0 2rem 0', textAlign: 'center', fontSize: '1.8rem', color: '#B91C1C' }}>
                Cancel Order
            </h3>

            <p style={{ color: '#6B7280', marginBottom: '1rem' }}>
                Please select one or more reasons for cancellation (optional), or write your own.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {predefinedReasons.map((reason) => (
                    <div
                        key={reason.id}
                        onClick={() => toggleReason(reason.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            padding: '0.8rem 1rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            border: selectedReasons.includes(reason.id) ? '2px solid #B91C1C' : '1.5px solid #E5E7EB',
                            backgroundColor: selectedReasons.includes(reason.id) ? '#FEE2E2' : 'white',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span style={{ fontSize: '1.2rem', color: selectedReasons.includes(reason.id) ? '#B91C1C' : '#6B7280' }}>
                            {reason.icon}
                        </span>
                        <span style={{ fontWeight: '500', color: selectedReasons.includes(reason.id) ? '#B91C1C' : '#374151' }}>
                            {reason.text}
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                <label htmlFor="cancel-reason" style={{ fontWeight: '500', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiEdit3 /> Custom reason:
                </label>
                <textarea
                    id="cancel-reason"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="e.g., Emergency situation"
                    style={{
                        width: '100%',
                        minHeight: '90px',
                        border: '1.5px solid #ccc',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        marginTop: '0.5rem',
                        boxSizing: 'border-box',
                        resize: 'vertical'
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                    onClick={onCancel}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '10px',
                        border: '1.5px solid #D1D5DB',
                        backgroundColor: 'white',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#B91C1C',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Confirm Cancellation
                </button>
            </div>
        </motion.div>
    );
};


export function ViewOrderPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [vehicleType, setVehicleType] = useState(null);
    const [error, setError] = useState('');
    const [driverLocation, setDriverLocation] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const navigate = useNavigate();
        const refreshOrderDetails = async () => {
        try {
            const updatedOrder = await getOrderDetails(orderId);
            setOrder(updatedOrder);
        } catch (err) {
            toast.error("Could not refresh order details.");
        }
    };


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

                if (driverInfo.latitude && driverInfo.longitude) {
                    setDriverLocation({
                        lat: driverInfo.latitude,
                        lng: driverInfo.longitude
                    });
                } else if (orderDetails.driverCoordinates) {
                    setDriverLocation(orderDetails.driverCoordinates);
                }
                return true;
            } catch (err) {
                setError('Failed to load page data.');
                return false;
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

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, [orderId]);


    // --- KLJUČNA IZMENA: MEMOIZACIJA PROPS-OVA ZA MAPU ---
    // Kreiramo stabilne reference koje se menjaju samo kada se 'order' zaista promeni.
    const assignedDeliveriesForMap = useMemo(() => {
        return order ? [order] : [];
    }, [order]);
        // DODAJ OVU CELU FUNKCIJU
    const handleStartDriving = async () => {
        if (!order) return;
        try {
            toast.loading('Starting simulation...', { id: 'sim-start' });
            await startSimulation(order.id);
            toast.dismiss('sim-start');
            toast.success("Simulation started!");
            await refreshOrderDetails();
        } catch (error) {
            toast.dismiss('sim-start');
            toast.error("Could not start simulation.");
        }
    };

    const newOffersForMap = useMemo(() => {
        return [];
    }, []); // Prazan niz zavisnosti znači da će se referenca kreirati samo jednom.

// U FAJLU: src/pages/ViewOrderPage.jsx

// ...
const handleMarkAsPickedUp = async () => {
    if (!order) return;
    try {
        toast.loading('Marking as picked up...', { id: 'pickup-toast' });
        await markOrderAsPickedUp(order.id);
        toast.dismiss('pickup-toast');
        toast.success('Order picked up!');
        
        // --- KLJUČNA IZMENA: NAVIGACIJA NA NOVU STRANICU ---
        navigate(`/delivery/${order.id}`);

    } catch (error) {
        toast.dismiss('pickup-toast');
        toast.error(error.response?.data?.message || "Failed to mark as picked up.");
    }
};
// ...

    const handleReportDelay = () => {
        if (order.status !== 'PICKED_UP') {
            toast.error("You can't report a delay for an order that hasn't been picked up yet.");
            return;
        }
        alert("TODO: Implement Report Delay Modal!");
    };

    const handleCancelDelivery = async (reason) => {
        try {
            await cancelDelivery(orderId, reason);
            toast.success("Order successfully canceled!");
            navigate('/driver');
        } catch (error) {
            toast.error("Error cancelling delivery: " + (error.response?.data?.message || error.message));
        }
    };

    // Stilovi za gumbe (nepromenjeni)
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

    // Loading/Error prikaz (nepromenjen)
    if (loading) {
        return (
            <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh' }}>
                <NavbarDriver />
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    Loading order details...
                </div>
            </div>
        );
    }
    
    if (error || !order) {
        return (
            <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh' }}>
                <NavbarDriver />
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    {error ? <span style={{color: 'red'}}>{error}</span> : 'Order not found.'}
                </div>
            </div>
        );
    }
    
    const isPickedUp = order.status === 'PICKED_UP';
    
    // Glavni return blok sa izmenjenim pozivom MapComponent
    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh', color: '#4A4A4A' }}>
             <Toaster position="top-center" />
            
            {/* OVERLAY I MODAL */}
            {isCancelModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 9998,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    backdropFilter: 'blur(5px)'
                }}>
                    <CancelOrderModal
                        onCancel={() => setIsCancelModalOpen(false)}
                        onConfirm={handleCancelDelivery}
                    />
                </div>
            )}
            <NavbarDriver />
            <main style={{ maxWidth: '1500px', margin: '20px 90px' }}>
                <div style={{
                    backgroundColor: '#FDFDF5',
                    padding: '2rem', borderRadius: '24px',
                    border: '1px solid #F3EAD9', boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
                    display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem', alignItems: 'start'
                }}>
                    
                    <div style={{ height: '85vh', borderRadius: '16px', overflow: 'hidden' }}>
                        {/* Prikazujemo mapu samo kada imamo lokaciju vozača */}
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

                    {/* VRAĆEN STARI DIZAJN DESNE KOLONE SA IKONICAMA */}
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #EAEAEA' }}>
                            <p style={{ textTransform: 'uppercase', color: '#6B7280', fontSize: '0.9rem', margin: 0, letterSpacing: '0.5px' }}>Estimated Arrival (ETA)</p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.25rem 0 0 0', color: '#333' }}>
                                {'N/A'}
                            </p>
                        </div>
                        
                        <div style={{ marginTop: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #EAEAEA' , opacity: 1.6,}}>
                            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', margin: 0, color: '#8A643B', display: 'flex', alignItems: 'center' }}>
                                <FiMapPin style={{ marginRight: '0.5rem' }} /> Step 1: Pickup
                            </p>
                            <p style={{ fontSize: '1.2rem', margin: '0.5rem 0 0.25rem 0', fontWeight: '500' }}>{order.restaurantName}</p>
                            <p style={{ color: '#6B7280', margin: 0 }}>{order.restaurantAddress}</p>
                        </div>

                        <div style={{ marginTop: '1.5rem' ,opacity: isPickedUp ? 1 : 0.6, transition: 'opacity 0.3s ease'}}>
                            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', margin: 0, color: '#2F855A', display: 'flex', alignItems: 'center' }}>
                                <FiUser style={{ marginRight: '0.5rem' }} /> Step 2: Deliver
                            </p>
                            <p style={{ fontSize: '1.2rem', margin: '0.5rem 0 0.25rem 0', fontWeight: '500' }}>
                                {order.customerFirstName} {order.customerLastName}
                            </p>
                            <p style={{ color: '#6B7280', margin: 0 }}>{order.deliveryAddress}</p>
                        </div>

                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto', paddingTop: '1.5rem' }}>
    
                            {/* --- GLAVNO DUGME --- */}
                            
                            {/* Ako je status 'PICKED_UP', prikazujemo "Mark as Delivered" */}
                            {isPickedUp ? (
                                <button
                                    style={{ ...primaryButtonStyle, backgroundColor: '#2E7D32' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#256627'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2E7D32'}
                                    // onClick={handleMarkAsDelivered} // TODO
                                >
                                    <FiCheckCircle /> Mark as Delivered
                                </button>
                            ) : (
                                // Ako status NIJE 'PICKED_UP', prikazujemo "Mark as Picked Up"
                                <button
                                    onClick={handleMarkAsPickedUp}
                                    style={{ ...primaryButtonStyle, backgroundColor: '#1F2937' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#111827'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1F2937'}
                                >
                                    <FiCheckCircle /> Mark as Picked Up
                                </button>
                            )}

                            {/* --- DUGME ZA SIMULACIJU --- */}
                            
                            {/* Prikazujemo dugme za pokretanje simulacije samo u relevantnim statusima */}
                            {(order.status === 'READY_FOR_PICKUP' || order.status === 'PICKED_UP') && (
                                <button
                                    onClick={handleStartDriving}
                                    style={{ ...primaryButtonStyle, backgroundColor: '#8A643B' }} // Neutralna boja
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#78552f'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#8A643B'}
                                >
                                    <FiNavigation /> Start Driving to Restaurant
                                </button>
                            )}

                            {/* --- SEKUNDARNA DUGMAD --- */}
                            
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={handleReportDelay}
                                    style={{
                                        ...secondaryButtonStyle,
                                        backgroundColor: order.status !== 'PICKED_UP' ? '#F3F4F6' : 'white',
                                        color: order.status !== 'PICKED_UP' ? '#9CA3AF' : '#4A4A4A',
                                        borderColor: order.status !== 'PICKED_UP' ? '#E5E7EB' : '#D1D5DB',
                                        cursor: order.status !== 'PICKED_UP' ? 'not-allowed' : 'pointer'
                                    }}
                                    onMouseEnter={e => {
                                        if (order.status === 'PICKED_UP') {
                                            e.currentTarget.style.borderColor = '#bc9124';
                                            e.currentTarget.style.backgroundColor = '#FFFBEB';
                                            e.currentTarget.style.color = '#bc9124';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (order.status === 'PICKED_UP') {
                                            e.currentTarget.style.borderColor = '#D1D5DB';
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.color = '#4A4A4A';
                                        }
                                    }}
                                >
                                    <FiAlertTriangle size={14} /> Report Delay
                                </button>
                                <button
                                    onClick={() => setIsCancelModalOpen(true)}
                                    style={secondaryButtonStyle}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#4A4A4A'; }}
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