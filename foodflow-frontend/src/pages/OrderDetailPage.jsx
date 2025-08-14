import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { getOrderDetailsCustomer } from '@/services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, ShoppingCart, Home, CreditCard, Clock } from 'lucide-react';

// --- POMOĆNE FUNKCIJE I KOMPONENTE ---
const formatStatus = (status) => {
    if (!status) return '';
    return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const getStatusBadgeClasses = (status) => {
    if (['DELIVERED', 'CONFIRMED'].includes(status)) return 'bg-green-100 text-green-700';
    if (['CANCELED', 'REJECTED'].includes(status)) return 'bg-red-100 text-red-700';
    if (['SCHEDULED_PENDING'].includes(status)) return 'bg-blue-100 text-blue-700';
    return 'bg-orange-100 text-orange-700';
};

const OrderItemCard = ({ item }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
        <div className="flex items-center gap-4">
            <img src={item.imageUrl || 'https://via.placeholder.com/64'} alt={item.name} className="w-16 h-16 rounded-md object-cover"/>
            <div>
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">{item.quantity} x {item.price.toFixed(2)} RSD</p>
            </div>
        </div>
        <p className="font-semibold text-gray-800">{(item.price * item.quantity).toFixed(2)} RSD</p>
    </div>
);

const InfoBlock = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center gap-3 mb-3">
            {icon}
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="space-y-2 text-sm text-gray-600">{children}</div>
    </div>
);

const OrderDetailPageSkeleton = () => (
    <div className="w-full min-h-screen bg-[#F9F5EC]">
        <Navbar />
        <main className="container mx-auto px-4 md:px-6 py-8 animate-pulse">
            <div className="h-9 w-40 bg-gray-200 rounded-md mb-6"></div>
            <div className="bg-white p-8 rounded-lg shadow-md mb-8 space-y-4">
                <div className="h-8 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-64 bg-white rounded-xl shadow-sm"></div>
                <div className="lg:col-span-1 h-64 bg-white rounded-xl shadow-sm"></div>
            </div>
        </main>
    </div>
);

// --- GLAVNA REDIZAJNIRANA KOMPONENTA ---
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

    if (loading) return <OrderDetailPageSkeleton />;
    if (!order) return <div className="text-center p-10">Order not found.</div>;

   return (
        <div className="w-full min-h-screen bg-[#F9F5EC]">
            <Navbar />
            <main className="container mx-auto px-4 md:px-6 py-8">
                <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-[#D4A056] hover:underline mb-6">
                    <ArrowLeft size={16} />
                    Back to My Orders
                </Link>

                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <p className="text-sm text-gray-500">Order #{order.id}</p>
                            <h1 className="text-3xl font-bold text-gray-800">from {order.restaurantName}</h1>
                        </div>
                        <div className="mt-4 sm:mt-0 text-left sm:text-right">
                             <div className={`inline-block px-3 py-1.5 text-sm font-semibold rounded-full ${getStatusBadgeClasses(order.status)}`}>
                                {formatStatus(order.status)}
                            </div>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{order.total.toFixed(2)} RSD</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* LEVA KOLONA - Stavke i cene */}
                    <div className="lg:col-span-2 space-y-8">
                        <InfoBlock icon={<ShoppingCart size={20} className="text-[#D4A056]" />} title="Order Summary">
                            {order.items.map((item, index) => <OrderItemCard key={index} item={item} />)}
                        </InfoBlock>
                        
                        <InfoBlock icon={<CreditCard size={20} className="text-[#D4A056]" />} title="Payment Details">
                            <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-gray-800">{order.subtotal.toFixed(2)} RSD</span></div>
                            <div className="flex justify-between">
                                <span>Delivery</span>
                                {order.couponCode ? (<span className="font-medium text-gray-400 line-through">150.00 RSD</span>) : (<span className="font-medium text-gray-800">{order.deliveryPrice.toFixed(2)} RSD</span>)}
                            </div>
                            {order.couponCode && (<div className="flex justify-between font-bold text-green-600"><span>Free Delivery ({order.couponCode})</span><span>0.00 RSD</span></div>)}
                            <hr className="my-2 border-dashed"/>
                            <div className="flex justify-between text-lg font-bold text-gray-800"><span>Total</span><span>{order.total.toFixed(2)} RSD</span></div>
                             <div className="flex justify-between pt-2 border-t mt-2"><span>Payment Method</span><span className="font-medium text-gray-800 capitalize">{order.paymentMethod.toLowerCase()}</span></div>
                        </InfoBlock>
                    </div>

                    {/* DESNA KOLONA - Info o isporuci i statusu */}
                    <div className="space-y-8">
                         <InfoBlock icon={<Home size={20} className="text-[#D4A056]" />} title="Delivery & Time">
                            <div>
                                <p className="font-semibold text-gray-800">Address:</p>
                                <p>{order.deliveryAddress}</p>
                            </div>
                             <div>
                                <p className="font-semibold text-gray-800 mt-2">Order Placed:</p>
                                <p>{format(new Date(order.creationDate), 'MMM d, yyyy HH:mm')}</p>
                            </div>
                         </InfoBlock>
                    </div>
                </div>
            </main>
        </div>
    );
}