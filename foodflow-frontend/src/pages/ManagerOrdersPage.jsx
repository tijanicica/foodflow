import React, { useState, useEffect } from 'react';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar';
import { Button } from '@/components/ui/button';
import { getManagerActiveOrders, confirmManagerOrder, rejectManagerOrder, markOrderAsReady } from '@/services/api';
import toast from 'react-hot-toast';

// Vraćamo WebSocket biblioteke jer je ova stranica sada glavni kontroler
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { jwtDecode } from 'jwt-decode';

// Importujemo ikonice potrebne za stilizovane tostere
import { Bell, X, CheckCircle, AlertTriangle, Truck, XCircle } from 'lucide-react';

// --- POMOĆNE FUNKCIJE PREMEŠTENE OVDE ---

/**
 * Pomoćna funkcija koja određuje stil i sadržaj notifikacije na osnovu njenog tipa.
 */
const getNotificationDetails = (notification) => {
  let details = { title: 'New Update', Icon: Bell, bgColor: 'bg-blue-100', textColor: 'text-blue-600' };
  switch (notification.type) {
    case 'OFFER_ACCEPTED':
      details = { title: 'Offer Accepted', Icon: CheckCircle, bgColor: 'bg-green-100', textColor: 'text-green-600' };
      break;
    case 'OFFER_REJECTED':
      details = { title: 'Offer Rejected', Icon: AlertTriangle, bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' };
      break;
    case 'ORDER_STATUS_UPDATE':
      switch (notification.status) {
        case 'PICKED_UP': details = { title: 'Order Picked Up', Icon: Truck, bgColor: 'bg-sky-100', textColor: 'text-sky-600' }; break;
        case 'DELIVERED': details = { title: 'Order Delivered', Icon: CheckCircle, bgColor: 'bg-green-100', textColor: 'text-green-600' }; break;
        case 'CANCELED': details = { title: 'Delivery Canceled', Icon: XCircle, bgColor: 'bg-red-100', textColor: 'text-red-600' }; break;
        default: details.title = 'Order Status Updated';
      }
      break;
    // Ovde možete dodati case za tip notifikacije koji je koleginica radila, ako je drugačiji
    // Npr. case 'NEW_MANAGER_ORDER': details = { ... }; break;
  }
  return details;
};

/**
 * Funkcija koja renderuje stilizovani toster.
 */
const showCustomToast = (notification) => {
    const { title, Icon, bgColor, textColor } = getNotificationDetails(notification);
    toast.custom(
        (t) => (
          <div className={`max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 relative z-50 ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
            <div className="flex-1 w-0 p-4"><div className="flex items-start"><div className="flex-shrink-0 pt-0.5"><span className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${bgColor}`}><Icon className={`h-6 w-6 ${textColor}`} /></span></div><div className="ml-3 flex-1"><p className="text-sm font-medium text-gray-900">{title}</p><p className="mt-1 text-sm text-gray-500">{notification.message}</p></div></div></div>
            <div className="flex items-center p-2"><button onClick={() => toast.dismiss(t.id)} className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 relative z-10"><X className="h-5 w-5 text-gray-500" /></button></div>
          </div>
        ), { id: `notification-${Date.now()}`, duration: 10000, position: "top-right" }
    );
};


// Komponenta za karticu porudžbine (bez izmena)
const OrderCard = ({ order, onConfirm, onReject, onMarkAsReady }) => (
    <div className={`p-4 rounded-lg shadow-md mb-4 ${order.status === 'READY_FOR_PICKUP' ? 'bg-green-100' : 'bg-white'}`}>
        <p className="font-bold text-sm text-gray-800">{order.orderNumber} - {order.customerName}</p>
        <div className="text-xs text-gray-600 my-2 space-y-1">
            {order.items.map((item, index) => <div key={index}>{item}</div>)}
        </div>
        {order.status === 'CREATED' && (
            <div className="flex gap-2 mt-3">
                <Button onClick={() => onConfirm(order.id)} size="sm" className="flex-1">Confirm</Button>
                <Button onClick={() => onReject(order.id)} size="sm" variant="outline" className="flex-1">Reject</Button>
            </div>
        )}
        {order.status === 'CONFIRMED' && (
             <Button onClick={() => onMarkAsReady(order.id)} size="sm" className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700">Mark as Ready</Button>
        )}
        {order.status === 'READY_FOR_PICKUP' && (
             <p className="text-xs text-center text-green-800 font-semibold mt-2">{order.driverName}</p>
        )}
    </div>
);

// Komponenta za kolonu (bez izmena)
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
        try {
            const data = await getManagerActiveOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to load active orders:", error);
            // Ne prikazujemo toast ovde da ne bismo spamovali korisnika pri svakom osvežavanju
        } finally {
            if (loading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(); // Učitaj inicijalne podatke

        const token = localStorage.getItem('jwtToken');
        if (!token) return;
        
        let managerId, managerEmail;
        try {
            const decodedToken = jwtDecode(token); 
            managerId = decodedToken.id;
            managerEmail = decodedToken.sub;
        } catch (e) {
            console.error("Invalid token:", e);
            return;
        }

        if (!managerId || !managerEmail) return;

        const socket = new SockJS('http://localhost:8088/ws');
        const stompClient = Stomp.over(socket);
        stompClient.debug = () => {}; // Isključuje detaljne logove u konzoli

        stompClient.connect({}, (frame) => {
            console.log('WebSocket Connected. Setting up subscriptions...');
            
            // --- PRETPLATA #1: Globalni kanal (za notifikacije od vozača) ---
            const globalTopic = `/topic/user/${managerEmail.replace("@", "-at-").replace(".", "-dot-")}`;
            console.log("Subscribing to GLOBAL topic:", globalTopic);
            stompClient.subscribe(globalTopic, (message) => {
                const notification = JSON.parse(message.body);
                console.log("Received GLOBAL notification:", notification);
                showCustomToast(notification);
                fetchOrders();
            });

            // --- PRETPLATA #2: Lokalni kanal (za notifikacije specifične za ovu stranicu) ---
            const pageTopic = `/topic/manager/${managerId}/orders`;
            console.log("Subscribing to PAGE-SPECIFIC topic:", pageTopic);
            stompClient.subscribe(pageTopic, (message) => {
                const notification = JSON.parse(message.body);
                console.log("Received PAGE-SPECIFIC notification:", notification);
                showCustomToast(notification); // Koristimo istu funkciju za prikaz
                fetchOrders();
            });
        });

        // Cleanup funkcija koja prekida vezu kada se napusti stranica
        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect(() => {
                    console.log('WebSocket Disconnected');
                });
            }
        };
    }, []);

    const handleConfirm = async (id) => {
        await toast.promise(confirmManagerOrder(id), { loading: 'Confirming...', success: 'Order confirmed!', error: 'Failed to confirm.' });
        fetchOrders();
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Please enter the reason for rejection (optional):");
        if (reason !== null) {
             await toast.promise(rejectManagerOrder(id, reason), { loading: 'Rejecting...', success: 'Order rejected!', error: 'Failed to reject.' });
            fetchOrders();
        }
    };

    const handleMarkAsReady = async (id) => {
        await toast.promise(markOrderAsReady(id), { loading: 'Updating...', success: 'Marked as ready!', error: 'Failed to update.' });
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