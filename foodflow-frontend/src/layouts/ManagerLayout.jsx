import React, { useState, useEffect } from 'react';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar';
import { Button } from '@/components/ui/button';
import { getManagerActiveOrders, confirmManagerOrder, rejectManagerOrder, markOrderAsReady } from '@/services/api';
import toast from 'react-hot-toast';

// SVI WEBSOCKET IMPORTI SU UKLONJENI. OVA KOMPONENTA JE SADA "GLUPA".

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
        } finally {
            if (loading) setLoading(false);
        }
    };

    // JEDINA IZMENA JE OVDE: useEffect sada sluša za događaj, a ne pravi konekciju
    useEffect(() => {
        fetchOrders(); // Učitaj inicijalne podatke

        // Funkcija koja reaguje na događaj koji šalje ManagerLayout
        const handleManagerNotification = (event) => {
            console.log('ManagerOrdersPage: Heard "manager-notification" event! Refreshing data...');
            // Vizuelnu notifikaciju (toster) prikazuje Layout,
            // ova stranica je samo odgovorna za osvežavanje svojih podataka.
            fetchOrders();
        };

        // Postavljamo "slušalicu" za događaj
        window.addEventListener('manager-notification', handleManagerNotification);

        // Cleanup funkcija koja uklanja "slušalicu" kada se komponenta uništi
        return () => {
            window.removeEventListener('manager-notification', handleManagerNotification);
        };
    }, []); // Prazan niz osigurava da se ovo izvršava samo jednom

    const handleConfirm = async (id) => {
        await toast.promise(confirmManagerOrder(id), { loading: 'Confirming...', success: 'Order confirmed!', error: 'Failed to confirm.' });
        fetchOrders();
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Reason for rejection (optional):");
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