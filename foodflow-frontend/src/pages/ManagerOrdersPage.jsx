import React, { useState, useEffect } from 'react';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar';
import { Button } from '@/components/ui/button';
import { getManagerActiveOrders, confirmManagerOrder, rejectManagerOrder, markOrderAsReady } from '@/services/api';
import toast from 'react-hot-toast';

// WebSocket biblioteke
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { jwtDecode } from 'jwt-decode'; // Treba nam da izvučemo ID menadžera

// Komponenta za jednu karticu porudžbine
const OrderCard = ({ order, onConfirm, onReject, onMarkAsReady }) => (
    <div className={`p-4 rounded-lg shadow-md mb-4 ${order.status === 'READY_FOR_PICKUP' ? 'bg-green-100' : 'bg-white'}`}>
        <p className="font-bold text-sm text-gray-800">{order.orderNumber} - {order.customerName}</p>
        <div className="text-xs text-gray-600 my-2 space-y-1">
            {order.items.map((item, index) => <div key={index}>{item}</div>)}
        </div>
        
        {/* Dugmići za NOVE porudžbine */}
        {order.status === 'CREATED' && (
            <div className="flex gap-2 mt-3">
                <Button onClick={() => onConfirm(order.id)} size="sm" className="flex-1">Confirm</Button>
                <Button onClick={() => onReject(order.id)} size="sm" variant="outline" className="flex-1">Reject</Button>
            </div>
        )}

        {/* Dugme za porudžbine U PRIPREMI */}
        {order.status === 'CONFIRMED' && (
             <Button onClick={() => onMarkAsReady(order.id)} size="sm" className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700">Mark as Ready</Button>
        )}

        {/* Prikaz za porudžbine SPREMNE ZA PREUZIMANJE */}
        {order.status === 'READY_FOR_PICKUP' && (
             <p className="text-xs text-center text-green-800 font-semibold mt-2">{order.driverName}</p>
        )}
    </div>
);

// Komponenta za jednu kolonu sa porudžbinama
const OrderColumn = ({ title, orders, ...actions }) => (
    <div className="flex-1 p-4 bg-gray-100/50 rounded-lg min-h-[200px]">
        <h2 className="font-bold mb-4 text-gray-700">{title} ({orders.length})</h2>
        <div>
            {orders.length > 0 ? 
                orders.map(order => <OrderCard key={order.id} order={order} {...actions} />) :
                <p className="text-sm text-gray-400 text-center mt-8">No orders in this stage.</p>
            }
        </div>
    </div>
);

// Glavna komponenta stranice
export function ManagerOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        // Ne postavljamo loading na true ovde da bi osvežavanje bilo tiho u pozadini
        try {
            const data = await getManagerActiveOrders();
            setOrders(data);
        } catch (error) {
            toast.error("Failed to load active orders.");
        } finally {
            setLoading(false); // Postavljamo loading na false tek nakon prvog učitavanja
        }
    };

    useEffect(() => {
        fetchOrders(); // Učitaj inicijalne podatke

        const token = localStorage.getItem('jwtToken');
        if (!token) return;
        
        let managerId;
        try {
            const decodedToken = jwtDecode(token); 
            managerId = decodedToken.id; // Prilagodi ako je ključ drugačiji
        } catch (e) {
            console.error("Invalid token:", e);
            return;
        }

        if (!managerId) return;

        const socket = new SockJS('http://localhost:8088/ws');
        const stompClient = Stomp.over(socket);

        stompClient.connect({}, (frame) => {
            console.log('Connected to WebSocket: ' + frame);
            
            stompClient.subscribe(`/topic/manager/${managerId}/orders`, (notification) => {
                const body = JSON.parse(notification.body);
                toast.success(body.message, { icon: '🚚', duration: 5000 });
                fetchOrders(); // Osveži listu porudžbina
            });
        });

        // Prekini vezu kada se komponenta uništi
        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
                console.log('Disconnected from WebSocket');
            }
        };
    }, []); // Prazan niz osigurava da se ovo izvršava samo jednom

    const handleConfirm = async (id) => {
        await toast.promise(confirmManagerOrder(id), {
            loading: 'Confirming...', success: 'Order confirmed!', error: 'Failed to confirm.'
        });
        fetchOrders();
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Please enter the reason for rejection (optional):");
        // Nastavljamo čak i ako je razlog prazan, ali ne i ako klikne Cancel (što vraća null)
        if (reason !== null) {
             await toast.promise(rejectManagerOrder(id, reason), {
                loading: 'Rejecting...', success: 'Order rejected!', error: 'Failed to reject.'
            });
            fetchOrders();
        }
    };

    const handleMarkAsReady = async (id) => {
        await toast.promise(markOrderAsReady(id), {
            loading: 'Updating...', success: 'Marked as ready!', error: 'Failed to update.'
        });
        fetchOrders();
    };

    const newOrders = orders.filter(o => o.status === 'CREATED');
    const inProgressOrders = orders.filter(o => o.status === 'CONFIRMED');
    const readyForPickupOrders = orders.filter(o => o.status === 'READY_FOR_PICKUP');

    return (
        <div className="w-full min-h-screen bg-brand-background-light">
            <ManagerNavbar />
            <main className="container mx-auto px-4 md:px-6 py-8">
                <h1 className="text-4xl font-bold text-brand-primary mb-8">Active Orders</h1>
                {loading ? <p>Loading orders...</p> : (
                    <div className="flex flex-col md:flex-row gap-8">
                        <OrderColumn title="New" orders={newOrders} onConfirm={handleConfirm} onReject={handleReject} />
                        <OrderColumn title="In Progress" orders={inProgressOrders} onMarkAsReady={handleMarkAsReady} />
                        <OrderColumn title="Ready for Pickup" orders={readyForPickupOrders} />
                    </div>
                )}
            </main>
        </div>
    );
}