// src/pages/ManagerOrdersPage.jsx - FINALNA SPOJENA VERZIJA

import React, { useState, useEffect, useCallback } from 'react';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar'; // Pretpostavka da je putanja ispravna
import { getManagerActiveOrders, confirmManagerOrder, rejectManagerOrder, markOrderAsReady } from '@/services/api';
import toast from 'react-hot-toast';

// Ikonice za bolji vizuelni doživljaj
import { Bell, ChefHat, Check, Truck, X, UserCheck, UserX, XCircle, AlertTriangle } from 'lucide-react';

// --- POMOĆNA FUNKCIJA ZA PRIKAZ TOASTA ---
// Ova funkcija kombinuje logiku iz obe prethodne verzije
const showCustomToast = (notification) => {
  const getDetails = (notif) => {
    let details = { title: 'Update', Icon: Bell, bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
    switch (notif.type) {
      case 'OFFER_ACCEPTED':
        return { title: 'Offer Accepted', Icon: UserCheck, bgColor: 'bg-green-100', textColor: 'text-green-600' };
      case 'OFFER_REJECTED':
        return { title: 'Offer Rejected', Icon: UserX, bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' };
      case 'ORDER_STATUS_UPDATE':
        switch (notif.status) {
          case 'PICKED_UP': return { title: 'Order Picked Up', Icon: Truck, bgColor: 'bg-sky-100', textColor: 'text-sky-600' };
          case 'DELIVERED': return { title: 'Order Delivered', Icon: CheckCircle, bgColor: 'bg-indigo-100', textColor: 'text-indigo-600' };
          case 'CANCELED': return { title: 'Delivery Canceled', Icon: XCircle, bgColor: 'bg-red-100', textColor: 'text-red-600' };
        }
        break;
      // Možete dodati i druge tipove ovde ako postoje
    }
    return details;
  };

  const { title, Icon, bgColor, textColor } = getDetails(notification);

  toast.custom(
    (t) => (
      <div className={`max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 relative z-50 ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
        <div className="flex-1 w-0 p-4"><div className="flex items-start"><div className="flex-shrink-0 pt-0.5"><span className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${bgColor}`}><Icon className={`h-6 w-6 ${textColor}`} /></span></div><div className="ml-3 flex-1"><p className="text-sm font-medium text-gray-900">{title}</p><p className="mt-1 text-sm text-gray-500">{notification.message}</p></div></div></div>
        <div className="flex items-center p-2"><button onClick={() => toast.dismiss(t.id)} className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 relative z-10"><X className="h-5 w-5 text-gray-500" /></button></div>
      </div>
    ), { id: `notification-${Date.now()}`, duration: 10000, position: "top-right" }
  );
};

// --- STILIZOVANE KOMPONENTE SA DEVELOP GRANE ---
const OrderCard = ({ order, onConfirm, onReject, onMarkAsReady }) => {
    const statusStyles = {
        CREATED: 'border-l-pink-500',
        CONFIRMED: 'border-l-purple-500',
        READY_FOR_PICKUP: 'border-l-green-500',
    };
    return (
        <div className={`bg-white rounded-lg shadow-md p-5 border-l-4 ${statusStyles[order.status]} transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-gray-800">{order.customerName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">#{order.orderNumber}</p>
                </div>
            </div>
            <div className="text-sm text-gray-700 my-4 space-y-1.5 border-t border-b border-gray-100 py-3">
                {order.items.map((item, index) => <div key={index}>- {item}</div>)}
            </div>
            {order.status === 'CREATED' && (
                <div className="flex gap-2 mt-3">
                    <button onClick={() => onConfirm(order.id)} className="flex-1 flex items-center justify-center gap-2 bg-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors duration-300 text-sm">
                        <Check size={16} /> Potvrdi
                    </button>
                    <button onClick={() => onReject(order.id)} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-300 text-sm">
                        <X size={16} /> Odbij
                    </button>
                </div>
            )}
            {order.status === 'CONFIRMED' && (
                 <button onClick={() => onMarkAsReady(order.id)} className="w-full flex items-center justify-center gap-2 bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors duration-300 text-sm">
                     <ChefHat size={16} /> Označi kao spremno
                 </button>
            )}
            {order.status === 'READY_FOR_PICKUP' && (
                 <div className="flex items-center justify-center gap-2 text-sm text-green-800 font-semibold mt-2 bg-green-100 p-2 rounded-lg">
                    <Truck size={16} />
                    <span>Čeka vozača: {order.driverName || '...'}</span>
                 </div>
            )}
        </div>
    );
};

const OrderColumn = ({ title, orders, count, icon, color, ...actions }) => (
    <div className="flex-1 p-5 bg-white rounded-xl shadow-lg min-h-[300px]">
        <div className="flex items-center mb-5">
            <div className={`mr-3 p-2 rounded-full bg-${color}-100`}>{icon}</div>
            <h2 className={`font-bold text-lg text-gray-700`}>{title}</h2>
            <span className={`ml-2 text-sm font-semibold text-white bg-${color}-500 px-2.5 py-0.5 rounded-full`}>{count}</span>
        </div>
        <div className="space-y-4">
            {orders.length > 0 ? 
                orders.map(order => <OrderCard key={order.id} order={order} {...actions} />) :
                <p className="text-sm text-gray-400 text-center pt-16">Nema porudžbina u ovoj fazi.</p>
            }
        </div>
    </div>
);

// --- GLAVNA KOMPONENTA STRANICE ---
export function ManagerOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        try {
            const data = await getManagerActiveOrders();
            setOrders(data);
        } catch (error) {
            toast.error("Neuspešno učitavanje aktivnih porudžbina.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        const handleWebSocketMessage = (event) => {
            const notification = event.detail;
            console.log("ManagerOrdersPage received event:", notification);

            // Pokaži toster za relevantne notifikacije
            const managerNotificationTypes = ['OFFER_ACCEPTED', 'OFFER_REJECTED', 'ORDER_STATUS_UPDATE'];
            if (managerNotificationTypes.includes(notification.type)) {
                showCustomToast(notification);
            }

            // Uvek osveži listu porudžbina da bi se videla promena
            fetchOrders();
        };

        // Slušamo za GLOBALNI događaj koji emituje ManagerLayout
        window.addEventListener('websocket-notification', handleWebSocketMessage);

        return () => {
            window.removeEventListener('websocket-notification', handleWebSocketMessage);
        };
    }, [fetchOrders]); // Dodajemo fetchOrders kao zavisnost


    // Handler funkcije ostaju iste
    const handleConfirm = async (id) => {
        await toast.promise(confirmManagerOrder(id), {
            loading: 'Potvrđivanje...', success: 'Porudžbina potvrđena!', error: 'Greška pri potvrdi.'
        });
        fetchOrders();
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Unesite razlog odbijanja (opciono):");
        if (reason !== null) {
             await toast.promise(rejectManagerOrder(id, reason), {
                loading: 'Odbijanje...', success: 'Porudžbina odbijena!', error: 'Greška pri odbijanju.'
            });
            fetchOrders();
        }
    };

    const handleMarkAsReady = async (id) => {
        await toast.promise(markOrderAsReady(id), {
            loading: 'Ažuriranje...', success: 'Označeno kao spremno!', error: 'Greška pri ažuriranju.'
        });
        fetchOrders();
    };

    // Filtriranje i renderovanje ostaju isti
    const newOrders = orders.filter(o => o.status === 'CREATED');
    const inProgressOrders = orders.filter(o => o.status === 'CONFIRMED');
    const readyForPickupOrders = orders.filter(o => o.status === 'READY_FOR_PICKUP');

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-pink-50/50">
            <ManagerNavbar />
            <main className="container mx-auto px-4 md:px-6 py-10">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Aktivne Porudžbine</h1>
                <p className="text-gray-500 mb-8">Pratite sve porudžbine u realnom vremenu.</p>
                
                {loading ? <LoadingSpinner /> : (
                    <div className="flex flex-col md:flex-row gap-8">
                        <OrderColumn 
                            title="Nove"
                            orders={newOrders} 
                            count={newOrders.length}
                            icon={<Bell size={20} className="text-pink-500"/>}
                            color="pink"
                            onConfirm={handleConfirm} 
                            onReject={handleReject} 
                        />
                        <OrderColumn 
                            title="U pripremi"
                            orders={inProgressOrders}
                            count={inProgressOrders.length}
                            icon={<ChefHat size={20} className="text-purple-500"/>}
                            color="purple"
                            onMarkAsReady={handleMarkAsReady} 
                        />
                        <OrderColumn
                            title="Spremno za preuzimanje"
                            orders={readyForPickupOrders}
                            count={readyForPickupOrders.length}
                            icon={<Truck size={20} className="text-green-500"/>}
                            color="green"
                        />
                    </div>
                )}
            </main>
        </div>
    );
}