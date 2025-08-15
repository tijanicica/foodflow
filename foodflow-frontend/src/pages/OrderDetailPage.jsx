import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { getOrderDetailsCustomer } from '@/services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ArrowLeft, ShoppingCart, Home, CreditCard, CheckCircle, CookingPot, Bike, PackageCheck, Star, Map } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// --- Pomoćne komponente (redizajnirane za novi izgled) ---

const OrderItemCard = ({ item }) => (
    <div className="flex items-center gap-4 py-4">
        <img src={item.imageUrl || 'https://via.placeholder.com/64'} alt={item.name} className="w-16 h-16 rounded-lg object-cover border"/>
        <div className="flex-grow">
            <p className="font-semibold text-gray-800">{item.name}</p>
            <p className="text-sm text-gray-500">{item.quantity} x {item.price.toFixed(2)} RSD</p>
        </div>
        <p className="font-semibold text-brand-primary">{(item.price * item.quantity).toFixed(2)} RSD</p>
    </div>
);

const InfoBlock = ({ icon, title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border h-full ${className}`}>
        <div className="flex items-center gap-3 mb-4">
            {React.cloneElement(icon, { className: "text-brand-primary" })}
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="space-y-3 text-sm text-gray-600">{children}</div>
    </div>
);

const TimelineNode = ({ icon, title, time, isCompleted, isLast = false }) => (
    <div className="flex gap-4">
        <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-brand-primary border-brand-primary text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                {icon}
            </div>
            {!isLast && <div className={`w-0.5 mt-2 flex-grow ${isCompleted ? 'bg-brand-primary' : 'bg-gray-300'}`}></div>}
        </div>
        <div className="pt-2">
            <p className={`font-semibold ${isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>{title}</p>
            {time && <p className="text-xs text-gray-500">{format(new Date(time), 'MMM d, HH:mm')}</p>}
        </div>
    </div>
);

const OrderDetailPageSkeleton = () => (
    <div className="w-full min-h-screen bg-[#F9F5EC]"><Navbar /><main className="container mx-auto px-4 md:px-6 py-8 animate-pulse"><div className="h-9 w-40 bg-gray-200 rounded-md mb-6"></div><div className="h-32 bg-white rounded-lg shadow-md mb-8"></div><div className="grid grid-cols-1 lg:grid-cols-5 gap-8"><div className="lg:col-span-3 h-64 bg-white rounded-xl shadow-sm"></div><div className="lg:col-span-2 h-64 bg-white rounded-xl shadow-sm"></div></div></main><Footer /></div>
);


//================================================================================
// GLAVNA KOMPONENTA STRANICE
//================================================================================

export function OrderDetailPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const data = await getOrderDetailsCustomer(orderId);
                setOrder(data);
            } catch (error) { toast.error("Could not load order details."); } 
            finally { setLoading(false); }
        };
        fetchDetails();
    }, [orderId]);

    const statusInfo = useMemo(() => {
        if (!order) return {};
        const statuses = {
            'PENDING': { text: 'Order Placed', icon: <CheckCircle />, color: 'bg-blue-500', step: 1 },
            'CONFIRMED': { text: 'Preparing Food', icon: <CookingPot />, color: 'bg-yellow-500', step: 2 },
            'PICKED_UP': { text: 'On The Way', icon: <Bike />, color: 'bg-orange-500', step: 3 },
            'DELIVERED': { text: 'Delivered Successfully', icon: <PackageCheck />, color: 'bg-green-500', step: 4 },
        };
        return statuses[order.status] || { text: order.status.replace('_', ' '), icon: <CheckCircle />, color: 'bg-gray-500', step: 0 };
    }, [order]);
    
    if (loading) return <OrderDetailPageSkeleton />;
    if (!order) return (
        <div className="w-full min-h-screen bg-[#F9F5EC]"><Navbar /><div className="text-center p-10"><h2 className="text-2xl font-bold">Order Not Found</h2><p className="text-gray-600">The requested order could not be loaded.</p><Button asChild className="mt-4"><Link to="/orders">Back to My Orders</Link></Button></div><Footer /></div>
    );

    return (
        <div className="w-full min-h-screen bg-[#F9F5EC] flex flex-col">
            <Navbar />
            <main className="container mx-auto px-4 md:px-6 py-8 flex-grow">
                <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-brand-primary hover:underline mb-6">
                    <ArrowLeft size={16} /> Back to My Orders
                </Link>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Order from <span className="text-brand-primary">{order.restaurantName}</span></h1>
                    <p className="text-gray-500">Order ID: #{order.id}</p>
                </motion.div>
                
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className={`p-6 rounded-xl text-white my-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${statusInfo.color}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                           {React.cloneElement(statusInfo.icon, { size: 28 })}
                        </div>
                        <div>
                            <p className="text-sm uppercase font-bold tracking-wider">Status</p>
                            <p className="text-2xl font-bold">{statusInfo.text}</p>
                        </div>
                    </div>
                    {/* Logička dugmad */}
                    <div className="flex items-center gap-2">
                         {order.status === 'PICKED_UP' && <Button asChild className="bg-white/90 text-black hover:bg-white"><Link to={`/track/${order.id}`}><Map className="mr-2 h-4 w-4"/> Track Live</Link></Button>}
                         {order.status === 'DELIVERED' && <Button disabled={order.rated} className="bg-white/90 text-black hover:bg-white disabled:opacity-70"><Star className="mr-2 h-4 w-4"/> {order.rated ? 'Rated' : 'Rate Order'}</Button>}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                    {/* LEVA, ŠIRA KOLONA: STAVKE I PLAĆANJE */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-3 space-y-8">
                         <InfoBlock icon={<ShoppingCart size={24} />} title="Order Summary">
                            <div className="divide-y divide-dashed -mt-2">
                                {(order.items && Array.isArray(order.items)) ? (
                                    order.items.map((item, index) => <OrderItemCard key={index} item={item} />)
                                ) : (
                                    <p className="py-4 text-gray-500">No items found in this order.</p>
                                )}
                            </div>
                        </InfoBlock>
                        <InfoBlock icon={<CreditCard size={24} />} title="Payment Details">
                            <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-gray-800">{(order.subtotal || 0).toFixed(2)} RSD</span></div>
                            <div className="flex justify-between"><span>Delivery Fee</span><span>{(order.deliveryPrice || 0).toFixed(2)} RSD</span></div>
                            {order.couponCode && (<div className="flex justify-between font-bold text-green-600"><span>Discount ({order.couponCode})</span><span>-{(order.deliveryPrice || 0).toFixed(2)} RSD</span></div>)}
                            <div className="border-t border-dashed pt-3 mt-3">
                                <div className="flex justify-between font-bold text-lg text-brand-primary"><span>Total Paid</span><span>{(order.total || 0).toFixed(2)} RSD</span></div>
                            </div>
                        </InfoBlock>
                    </motion.div>

                    {/* DESNA, UŽA KOLONA: VREMENSKA LINIJA I ISPORUKA */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 space-y-8">
                        <InfoBlock icon={<Bike size={24} />} title="Delivery Timeline">
                           <TimelineNode icon={<CheckCircle size={20}/>} title="Order Placed" time={order.creationDate} isCompleted={statusInfo.step >= 1}/>
                           <TimelineNode icon={<CookingPot size={20}/>} title="Confirmed & Preparing" time={order.confirmedAt} isCompleted={statusInfo.step >= 2}/>
                           <TimelineNode icon={<Bike size={20}/>} title="Picked Up" time={order.pickedUpAt} isCompleted={statusInfo.step >= 3}/>
                           <TimelineNode icon={<PackageCheck size={20}/>} title="Delivered" time={order.deliveredAt} isCompleted={statusInfo.step >= 4} isLast={true}/>
                        </InfoBlock>
                        <InfoBlock icon={<Home size={24} />} title="Delivery Details">
                            <div><p className="font-semibold text-gray-800">Address:</p><p>{order.deliveryAddress || 'N/A'}</p></div>
                            <div><p className="font-semibold text-gray-800">Payment Method:</p><p className="capitalize">{(order.paymentMethod || '').toLowerCase()}</p></div>
                        </InfoBlock>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}