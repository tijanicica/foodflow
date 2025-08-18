// src/pages/ManagerDeliveriesPage.jsx

import React, { useState, useEffect } from 'react';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar';
import { getManagerDeliveries, rateDriverByManager } from '@/services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { RateDriverModal } from '@/components/modals/RateDriverModal';

// Ikonice za vizuelni identitet
import { PackageCheck, Bike, Star, MapPin, CheckCircle } from 'lucide-react';

// === Potpuno redizajnirana kartica za dostavu ===
const DeliveryRow = ({ delivery, onRate, onTrack }) => {
    
    // Definišemo stilove i ikonice na osnovu statusa
    const statusConfig = {
        READY_FOR_PICKUP: {
            icon: <PackageCheck size={24} className="text-blue-600" />,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        PICKED_UP: {
            icon: <Bike size={24} className="text-purple-600" />,
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200'
        },
        DELIVERED: {
            icon: <Star size={24} className="text-green-600" />,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        }
    };

    const config = statusConfig[delivery.status] || {};

    return (
        <div className={`flex items-center justify-between p-4 ${config.bgColor} rounded-xl shadow-md border ${config.borderColor} transition-all duration-300 hover:shadow-lg hover:border-pink-300`}>
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm">{config.icon}</div>
                <div>
                    <p className="font-bold text-gray-800">{delivery.orderNumber}</p>
                    <p className="text-sm text-gray-600">{delivery.driverInfo}</p>
                </div>
            </div>
            <div>
                {delivery.status === 'PICKED_UP' && (
                    <button onClick={() => onTrack(delivery.orderId)} className="flex items-center gap-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-0.5 transition-all">
                        <MapPin size={16} /> Pratite na mapi
                    </button>
                )}
                {delivery.status === 'DELIVERED' && (
                    delivery.isRatedByManager ? (
                        <div className="flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-200/80 py-2 px-4 rounded-full">
                            <CheckCircle size={16} /> Ocenjeno
                        </div>
                    ) : (
                        <button onClick={() => onRate(delivery)} className="flex items-center gap-2 bg-pink-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-700 transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transform hover:-translate-y-0.5">
                            <Star size={16} /> Oceni Vozača
                        </button>
                    )
                )}
            </div>
        </div>
    );
};


// === GLAVNA KOMPONENTA STRANICE ===
export function ManagerDeliveriesPage() {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const navigate = useNavigate();

    // Handler funkcije ostaju iste, već su dobro optimizovane
    const fetchDeliveries = async () => { if (!loading) setLoading(true); try { const data = await getManagerDeliveries(); setDeliveries(data); } catch (error) { toast.error("Neuspešno učitavanje dostava."); } finally { setLoading(false); } };
    useEffect(() => { fetchDeliveries(); }, []);
    const handleRate = async (ratingData) => { const toastId = toast.loading('Slanje ocene...'); try { await rateDriverByManager(selectedDelivery.orderId, ratingData); setDeliveries(prev => prev.map(d => d.orderId === selectedDelivery.orderId ? { ...d, isRatedByManager: true } : d)); toast.success('Ocena sačuvana!', { id: toastId }); setSelectedDelivery(null); } catch (error) { toast.error('Greška pri slanju ocene.', { id: toastId }); } };

    const readyForPickup = deliveries.filter(d => d.status === 'READY_FOR_PICKUP');
    const inTransit = deliveries.filter(d => d.status === 'PICKED_UP');
    const completed = deliveries.filter(d => d.status === 'DELIVERED');

    const Section = ({ title, icon, deliveries, children }) => (
        <section>
            <div className="flex items-center gap-3 mb-4">
                {icon}
                <h2 className="text-2xl font-bold text-gray-700">{title}</h2>
                <span className="bg-pink-100 text-pink-700 font-semibold text-sm px-3 py-1 rounded-full">{deliveries.length}</span>
            </div>
            {deliveries.length > 0 ? 
                (<div className="space-y-4">{children}</div>) : 
                (<p className="text-center text-gray-400 py-8 bg-white/50 rounded-xl">Nema dostava u ovoj fazi.</p>)
            }
        </section>
    );

    const LoadingSpinner = () => (<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div></div>);

    return (
        <div className="w-full min-h-screen bg-pink-50/50">
            <ManagerNavbar />
            <main className="container mx-auto max-w-5xl px-4 py-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-800">Delivery Management</h1>
                    <p className="text-gray-500 mt-1">Pratite status svih aktivnih i završenih dostava u realnom vremenu.</p>
                </div>
                {loading ? <LoadingSpinner /> : (
                    <div className="space-y-12">
                        <Section title="Spremno za preuzimanje" icon={<PackageCheck size={24} className="text-blue-600"/>} deliveries={readyForPickup}>
                            {readyForPickup.map(d => <DeliveryRow key={d.orderId} delivery={d} />)}
                        </Section>
                        <Section title="U tranzitu" icon={<Bike size={24} className="text-purple-600"/>} deliveries={inTransit}>
                            {inTransit.map(d => <DeliveryRow key={d.orderId} delivery={d} onTrack={(id) => navigate(`/manager/deliveries/track/${id}`)} />)}
                        </Section>
                        <Section title="Završeno" icon={<Star size={24} className="text-green-600"/>} deliveries={completed}>
                            {completed.map(d => <DeliveryRow key={d.orderId} delivery={d} onRate={setSelectedDelivery} />)}
                        </Section>
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