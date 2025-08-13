import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { getOrderDetailsCustomer } from '@/services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Pomoćne funkcije
const formatStatus = (status) => {
    if (!status) return '';
    return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

export function OrderDetailPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await getOrderDetailsCustomer(orderId);
                setOrder(data);
            } catch (error) {
                toast.error("Could not load order details.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [orderId]);

    if (loading) {
        return <div className="text-center p-10">Loading order details...</div>;
    }

    if (!order) {
        return <div className="text-center p-10">Order not found.</div>;
    }

   return (
        <div className="w-full min-h-screen bg-[#F9F5EC]">
            <Navbar />
            <main className="container mx-auto px-4 md:px-6 py-8">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto relative">
                    <Link to="/orders" className="absolute top-6 right-8 text-sm text-[#D4A056] hover:underline flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Back to My Orders
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Details for Order #{order.id}</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* LEVA KOLONA - Stavke i cene */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700 italic mb-4">
                                Restaurant: <span className="font-bold text-[#D4A056] not-italic">{order.restaurantName}</span>
                            </h2>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between border-b pb-3">
                                        <div className="flex items-center gap-4">
                                            <img src={item.imageUrl || 'https://via.placeholder.com/64'} alt={item.name} className="w-16 h-16 rounded-md object-cover"/>
                                            <div>
                                                <p className="font-semibold text-gray-800">{item.quantity} x {item.name}</p>
                                                <p className="text-sm text-gray-500">{item.price.toFixed(2)} RSD each</p>
                                            </div>
                                        </div>
                                        <p className="font-medium text-lg text-gray-800">{(item.price * item.quantity).toFixed(2)} RSD</p>
                                    </div>
                                ))}
                            </div>
                                                 <div className="mt-6 space-y-3 text-gray-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-800">{order.subtotal.toFixed(2)} RSD</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span>Delivery</span>
                                    {/* Ako je kupon primenjen (deliveryPrice je 0), prikaži precrtanu originalnu cenu */}
                                    {order.couponCode ? (
                                        <span className="font-medium text-gray-400 line-through">150.00 RSD</span>
                                    ) : (
                                        <span className="font-medium text-gray-800">{order.deliveryPrice.toFixed(2)} RSD</span>
                                    )}
                                </div>

                                {/* Prikaz "Free Delivery" reda samo ako je kupon primenjen */}
                                {order.couponCode && (
                                    <div className="flex justify-between font-bold text-green-600">
                                        <span>Free Delivery ({order.couponCode})</span>
                                        <span>0.00 RSD</span>
                                    </div>
                                )}

                                <hr className="my-2 border-dashed"/>
                                <div className="flex justify-between text-xl font-bold text-gray-800">
                                    <span>Total</span>
                                    <span>{order.total.toFixed(2)} RSD</span>
                                </div>
                            </div>
                        </div>

                        {/* DESNA KOLONA - Status i info */}
                        {/* === KLJUČNA IZMENA JE OVDE === */}
                        <div>
                            {/* 1. Naslov je sada van obojenog diva */}
                            
                            {/* 2. Obojeni div sada sadrži samo informacije */}
                            <div className="bg-[#FAF7F0] p-6 rounded-lg space-y-5">
                                 <div>
                                     <p className="font-semibold text-gray-800">Status:</p>
                                     <p className="text-lg font-bold text-[#D4A056]">{formatStatus(order.status)}</p>
                                 </div>
                                 <div>
                                     <p className="font-semibold text-gray-800">Delivery Address:</p>
                                     <p className="text-gray-600">{order.deliveryAddress}</p>
                                 </div>
                                  <div>
                                     <p className="font-semibold text-gray-800">Payment Method:</p>
                                     <p className="text-gray-600 capitalize">{order.paymentMethod.toLowerCase()}</p>
                                 </div>
                                  <div>
                                     <p className="font-semibold text-gray-800">Order Placed:</p>
                                     <p className="text-gray-600">{format(new Date(order.creationDate), 'MMM d, yyyy HH:mm')}</p>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}