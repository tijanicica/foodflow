import React, { useState, useEffect } from 'react';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar';
import { Button } from '@/components/ui/button';
import { getManagerDeliveries, rateDriverByManager } from '@/services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { RateDriverModal } from '@/components/modals/RateDriverModal';

// ===== IZMENJENA KOMPONENTA =====
const DeliveryRow = ({ delivery, onRate, onTrack }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-md shadow-sm">
        <div>
            <p className="font-semibold">{delivery.orderNumber}</p>
            <p className="text-sm text-gray-600">{delivery.driverInfo}</p>
        </div>
        <div>
            {delivery.status === 'PICKED_UP' && (
                <Button variant="outline" size="sm" onClick={() => onTrack(delivery.orderId)}>Track on map</Button>
            )}
            {delivery.status === 'DELIVERED' && (
                <>
                    {/* Ako je ocenjen, prikaži "Rated" tekst */}
                    {delivery.isRatedByManager ? (
                        <span className="text-sm font-semibold text-green-600">Rated</span>
                    ) : (
                        // Ako nije, prikaži dugme
                        <Button size="sm" onClick={() => onRate(delivery)}>Rate Driver</Button>
                    )}
                </>
            )}
        </div>
    </div>
);

export function ManagerDeliveriesPage() {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const navigate = useNavigate();

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const data = await getManagerDeliveries();
            setDeliveries(data);
        } catch (error) {
            toast.error("Failed to load deliveries.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
    }, []);
    
    // ===== POTPUNO NOVA HANDLE RATE FUNKCIJA =====
    const handleRate = async (ratingData) => {
        const toastId = toast.loading('Submitting rating...');
        try {
            await rateDriverByManager(selectedDelivery.orderId, ratingData);
            
            // AŽURIRAMO LOKALNO STANJE - NEMA NOVOG POZIVA KA SERVERU!
            setDeliveries(prevDeliveries => 
                prevDeliveries.map(d => 
                    d.orderId === selectedDelivery.orderId 
                        ? { ...d, isRatedByManager: true } // Samo za ocenjenu dostavu promeni flag
                        : d // Ostale ostavi nepromenjene
                )
            );
            
            toast.success('Rating submitted!', { id: toastId });
            setSelectedDelivery(null); // Zatvori modal

        } catch (error) {
            toast.error('Failed to submit rating.', { id: toastId });
        }
    };

    const readyForPickup = deliveries.filter(d => d.status === 'READY_FOR_PICKUP');
    const inTransit = deliveries.filter(d => d.status === 'PICKED_UP');
    const completed = deliveries.filter(d => d.status === 'DELIVERED');

    return (
        <div className="w-full min-h-screen bg-brand-background-light">
            <ManagerNavbar />
            <main className="container mx-auto max-w-4xl px-4 py-8">
                <h1 className="text-4xl font-bold text-brand-primary mb-8">Delivery Management</h1>
                {loading ? <p>Loading...</p> : (
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold mb-4">Ready for Pickup ({readyForPickup.length})</h2>
                            <div className="space-y-3">{readyForPickup.map(d => <DeliveryRow key={d.orderId} delivery={d} />)}</div>
                        </section>
                        <section>
                            <h2 className="text-xl font-semibold mb-4">In Transit ({inTransit.length})</h2>
                            <div className="space-y-3">{inTransit.map(d => <DeliveryRow key={d.orderId} delivery={d} onTrack={(id) => navigate(`/manager/deliveries/track/${id}`)} />)}</div>
                        </section>
                        <section>
                            {/* Sada prikazujemo SVE završene dostave */}
                            <h2 className="text-xl font-semibold mb-4">Completed ({completed.length})</h2>
                            <div className="space-y-3">{completed.map(d => <DeliveryRow key={d.orderId} delivery={d} onRate={setSelectedDelivery} />)}</div>
                        </section>
                    </div>
                )}
            </main>
            {selectedDelivery && (
                <RateDriverModal 
                    delivery={selectedDelivery} 
                    onClose={() => setSelectedDelivery(null)} 
                    onSubmit={handleRate} 
                />
            )}
        </div>
    );
}