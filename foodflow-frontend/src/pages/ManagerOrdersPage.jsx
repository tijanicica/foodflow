// src/pages/ManagerOrdersPage.jsx

import React, { useState, useEffect } from 'react';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar';
import { getManagerActiveOrders, confirmManagerOrder, rejectManagerOrder, markOrderAsReady } from '@/services/api';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

// Ikonice za bolji vizuelni doživljaj
import { Bell, ChefHat, Check, Truck, X } from 'lucide-react';

// === STILIZOVANA KARTICA PORUDŽBINE ===
const OrderCard = ({ order, onConfirm, onReject, onMarkAsReady }) => {
    // Definišemo stilove na osnovu statusa
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

// === STILIZOVANA KOLONA ZA PORUDŽBINE ===
const OrderColumn = ({ title, orders, count, icon, color, ...actions }) => (
    <div className="flex-1 p-5 bg-white rounded-xl shadow-lg min-h-[300px]">
        <div className="flex items-center mb-5">
            <div className={`mr-3 p-2 rounded-full bg-${color}-100`}>{icon}</div>
            <h2 className={`font-bold text-lg text-gray-700`}>{title}</h2>
            <span className={`ml-2 text-sm font-semibold text-white bg-${color}-500 px-2.5 py-0.5 rounded-full`}>
                {count}
            </span>
        </div>
        <div className="space-y-4">
            {orders.length > 0 ? 
                orders.map(order => <OrderCard key={order.id} order={order} {...actions} />) :
                <p className="text-sm text-gray-400 text-center pt-16">Nema porudžbina u ovoj fazi.</p>
            }
        </div>
    </div>
);

// Glavna komponenta stranice
export function ManagerOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const data = await getManagerActiveOrders();
            setOrders(data);
        } catch (error) {
            toast.error("Neuspešno učitavanje aktivnih porudžbina.");
        } finally {
            if (loading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(); 

        const token = localStorage.getItem('jwtToken');
        if (!token) return;
        
        const managerId = jwtDecode(token)?.id;
        if (!managerId) return;

        const socket = new SockJS('http://localhost:8088/ws');
        const stompClient = Stomp.over(socket);

        stompClient.connect({}, (frame) => {
            console.log('Povezan na WebSocket: ' + frame);
            stompClient.subscribe(`/topic/manager/${managerId}/orders`, (notification) => {
                const body = JSON.parse(notification.body);
                toast.success(body.message, { icon: '🚚', duration: 5000 });
                fetchOrders();
            });
        });

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
                console.log('Diskonektovan sa WebSocket-a');
            }
        };
    }, []);

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

    // Filtriranje porudžbina
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
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Active Orders</h1>
                <p className="text-gray-500 mb-8">Pratite sve porudžbine u realnom vremenu.</p>
                
                {loading ? <LoadingSpinner /> : (
                    <div className="flex flex-col md:flex-row gap-8">
                        <OrderColumn 
                            title="New"
                            orders={newOrders} 
                            count={newOrders.length}
                            icon={<Bell size={20} className="text-pink-500"/>}
                            color="pink"
                            onConfirm={handleConfirm} 
                            onReject={handleReject} 
                        />
                        <OrderColumn 
                            title="In Progress"
                            orders={inProgressOrders}
                            count={inProgressOrders.length}
                            icon={<ChefHat size={20} className="text-purple-500"/>}
                            color="purple"
                            onMarkAsReady={handleMarkAsReady} 
                        />
                        <OrderColumn
                            title="Ready for Pickup"
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