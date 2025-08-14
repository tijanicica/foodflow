// FAJL: src/pages/PickedUpOrderPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { EtaCountdown } from '../components/EtaCountdown';

// WebSocket i API
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import { getOrderDetails, cancelDelivery,getDriverInfo, startSimulation,markOrderAsDelivered   } from '../services/api'; 
// Komponente i ikonice
import { MapComponent } from '../components/MapComponent';
import { NavbarDriver } from '../components/NavbarDriver';
import { FiMapPin, FiUser, FiCheckCircle, FiNavigation, FiAlertTriangle, FiXCircle } from 'react-icons/fi';


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
    const [timeLeft, setTimeLeft] = useState(null);
    const [predictedTimeLeft, setPredictedTimeLeft] = useState(null);
      const refreshOrderDetails = async () => {
        try {
            const updatedOrder = await getOrderDetails(orderId);
            setOrder(updatedOrder);
        } catch (err) {
            toast.error("Could not refresh order details.");
        }
    };

    // useEffect za dobavljanje podataka i WebSocket konekciju
       useEffect(() => {
    let stompClient = null;
    let timerInterval = null;

    const fetchPageData = async () => {
        try {
            setLoading(true);
            const [orderDetails, driverInfo] = await Promise.all([
                getOrderDetails(orderId),
                getDriverInfo()
            ]);

            setOrder(orderDetails);
            setVehicleType(driverInfo.vehicleType);

            // --- KLJUČNA IZMENA: postavi početnu lokaciju vozača ---
            if (driverInfo.latitude && driverInfo.longitude) {
                setDriverLocation({ lat: driverInfo.latitude, lng: driverInfo.longitude });
            } else if (orderDetails.driverCoordinates) {
                setDriverLocation(orderDetails.driverCoordinates);
            }

            // --- Inicijalni countdown za ETA ---
            if (orderDetails.eta) {
                const updateTimeLeft = () => {
                    setTimeLeft(Math.max(0, Math.ceil((new Date(orderDetails.eta) - new Date()) / 60000)));
                };
                updateTimeLeft();
                timerInterval = setInterval(updateTimeLeft, 60000); // ažuriraj svake minute
            }

            return true; // podaci uspešno učitani
        } catch (err) {
            console.error(err);
            setError('Failed to load page data. The order might not be assigned to you.');
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
                console.log('Connected to WebSocket');
                stompClient.subscribe(`/topic/driver-location/${orderId}`, (message) => {
    const newLocation = JSON.parse(message.body);
    setDriverLocation({ lat: newLocation.lat, lng: newLocation.lng });

if (newLocation.predictedTimeLeft !== undefined) {
                            setPredictedTimeLeft(newLocation.predictedTimeLeft);
                        }
});
            });
        }
    });

    // Cleanup funkcija
    return () => {
        if (stompClient && stompClient.connected) {
            stompClient.disconnect(() => console.log('Disconnected from WebSocket'));
        }
        if (timerInterval) {
            clearInterval(timerInterval);
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
            await refreshOrderDetails();
        } catch (error) {
            toast.dismiss('sim-start');
            toast.error("Could not start simulation.");
        }
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

    // TODO: Handleri za ostale akcije
     const handleMarkAsDelivered = async () => {
        if (!order) return;

        // Kreiramo jedinstveni ID za toast notifikaciju da bismo je mogli kontrolisati
        const toastId = 'deliver-toast';

        try {
            // 1. Pokaži korisniku da se nešto dešava
            toast.loading('Confirming delivery...', { id: toastId });

            // 2. Pozovi API. `await` će sačekati da se završi.
            await markOrderAsDelivered(order.id);

            // 3. Ako je API poziv uspeo (nije bacio grešku), prikaži poruku o uspehu
            toast.dismiss(toastId);
            toast.success('Order successfully delivered! Well done!');

            // 4. Nakon kratke pauze, preusmeri vozača na dashboard
            setTimeout(() => {
                navigate('/driver');
            }, 1500); // Pauza od 1.5 sekunde da vozač vidi poruku

        } catch (error) {
            // 5. Ako je API poziv bio neuspešan, uhvati grešku
            toast.dismiss(toastId);
            
            // Pročitaj poruku o grešci sa servera.
            // Ovo će prikazati "You are too far from the delivery address." ako je to uzrok.
            const errorMessage = error.response?.data?.message || "Failed to mark as delivered. Please try again.";
            
            // Prikaži grešku u crvenoj toast notifikaciji
            toast.error(errorMessage);
            
            console.error("Delivery failed:", error);
        }
    };
    const handleReportDelay = () => alert("TODO: Implement Report Delay!");

    // Memoizacija props-ova za mapu
    const assignedDeliveriesForMap = useMemo(() => order ? [order] : [], [order]);
    const newOffersForMap = useMemo(() => [], []);

    // Stilovi
    const primaryButtonStyle = { padding: '1rem', borderRadius: '8px', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'background-color 0.2s ease-in-out', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' };
    const secondaryButtonStyle = { flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1.5px solid #D1D5DB', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600', color: '#4A4A4A', transition: 'all 0.2s ease-in-out', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' };

    if (loading) return <div>Loading...</div>; // Skraćeni prikaz
    if (error || !order) return <div>{error || 'Order not found.'}</div>;
    
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
            <main style={{  maxWidth: '1500px', margin: '20px 90px' }}>
                <div style={{ backgroundColor: '#FDFDF5', padding: '2rem', borderRadius: '24px', border: '1px solid #F3EAD9', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem', alignItems: 'start' }}>
                    
                    {/* LEVA KOLONA - MAPA */}
                    <div style={{ height: '95vh', borderRadius: '16px', overflow: 'hidden' }}>
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
                            <p style={{ textTransform: 'uppercase', color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>
                                START TIME
                            </p>
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0.25rem 0', color: '#333' }}>
                                {order.startDeliveryTime ? new Date(order.startDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </p>

                            <p style={{ textTransform: 'uppercase', color: '#6B7280', fontSize: '0.9rem', marginTop: '1rem' }}>
                                ESTIMATED ARRIVAL (ETA)
                            </p>
                            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.25rem 0 0 0', color: '#333' }}>
                                {order.eta ? new Date(order.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </p>
                            
                            {order.eta 
                                ? <EtaCountdown eta={order.eta} /> 
                                : <p style={{color: '#6B7280', fontSize: '0.9rem', marginTop: '0.5rem'}}>Click "Start Driving" to get a prediction.</p>
                            }
                        </div>



                        {/* --- STEP 1: PICKUP (Neaktivan/Precrtan) --- */}
                        <div style={{ marginTop: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #EAEAEA', opacity: 1 }}>
                            <p style={{
                                textTransform: 'uppercase', fontWeight: 'bold', margin: 0,
                                color: '#A1A1AA', // Neutralna siva boja
                                textDecoration: 'line-through', // Precrtavanje
                                textDecorationColor: '#D4D4D8', // Svetlo siva linija
                                display: 'flex', alignItems: 'center'
                            }}>
                                <FiMapPin style={{ marginRight: '0.5rem' }} /> Step 1: Pickup
                            </p>
                            <p style={{
                                fontSize: '1.2rem', margin: '0.5rem 0 0.25rem 0', fontWeight: '500',
                                color: '#A1A1AA', textDecoration: 'line-through', textDecorationColor: '#D4D4D8'
                            }}>
                                {order.restaurantName}
                            </p>
                            <p style={{
                                color: '#A1A1AA', margin: 0, textDecoration: 'line-through', textDecorationColor: '#D4D4D8'
                            }}>
                                {order.restaurantAddress}
                            </p>
                        </div>
                        
                        {/* --- STEP 2: DELIVER (Aktivan) --- */}
                        <div style={{ marginTop: '1.5rem' }}>
                            <p style={{ textTransform: 'uppercase', fontWeight: 'bold', margin: 0, color: '#2F855A', display: 'flex', alignItems: 'center' }}>
                                <FiUser style={{ marginRight: '0.5rem' }} /> Step 2: Deliver
                            </p>
                            <p style={{ fontSize: '1.2rem', margin: '0.5rem 0 0.25rem 0', fontWeight: '500' }}>
                                {order.customerFirstName} {order.customerLastName}
                            </p>
                            <p style={{ color: '#6B7280', margin: 0 }}>{order.deliveryAddress}</p>
                        </div>

                        {/* DUGMAD */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto', paddingTop: '1.5rem' }}>
                            <button
                                onClick={handleMarkAsDelivered}
                                style={{ ...primaryButtonStyle, backgroundColor: '#2E7D32' }}
                            >
                                <FiCheckCircle /> Mark as Delivered
                            </button>
                                                        <button
                                onClick={handleStartDriving}
                                style={{ ...primaryButtonStyle, backgroundColor: '#8A643B' }}
                            >
                                <FiNavigation /> Start Driving to Customer
                            </button>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={handleReportDelay} style={secondaryButtonStyle}>
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