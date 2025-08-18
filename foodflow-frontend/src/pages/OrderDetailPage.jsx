import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { getOrderDetailsCustomer } from '@/services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ArrowLeft, Home, FileText, CheckCircle, CookingPot, Bike, PackageCheck, Star, Map } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { RateOrderModal } from '@/components/modals/RateOrderModal';

//================================================================================
// POMOĆNE KOMPONENTE (ostaju nepromenjene)
//================================================================================

const InfoBlock = ({ icon, title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border h-full ${className}`}>
        <div className="flex items-center gap-3 mb-4">
            {React.cloneElement(icon, { className: "text-brand-primary" })}
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="space-y-3 text-sm text-gray-600">{children}</div>
    </div>
);

const OrderDetailPageSkeleton = () => (
    <div className="w-full min-h-screen bg-[#F9F5EC]">
        <Navbar />
        <main className="container mx-auto px-4 md:px-6 py-8 animate-pulse">
            <div className="h-6 w-40 bg-gray-200 rounded-md mb-8"></div>
            <div className="text-center mb-12 space-y-3">
                <div className="h-6 w-1/4 mx-auto bg-gray-300 rounded"></div>
                <div className="h-12 w-1/3 mx-auto bg-gray-200 rounded-lg"></div>
                <div className="h-6 w-1/2 mx-auto bg-gray-200 rounded"></div>
            </div>
            <div className="h-32 bg-white rounded-2xl shadow-sm mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-64 bg-white rounded-xl shadow-sm"></div>
                <div className="h-64 bg-white rounded-xl shadow-sm"></div>
            </div>
        </main>
        <Footer />
    </div>
);

const StatusStep = ({ icon, label, time, isCompleted }) => (
    <div className="flex flex-col items-center gap-2 flex-1 text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
            {icon}
        </div>
        <div>
            <p className={`font-semibold text-sm ${isCompleted ? 'text-brand-primary' : 'text-gray-500'}`}>{label}</p>
            {time && <p className="text-xs text-gray-400">{format(new Date(time), 'HH:mm')}</p>}
        </div>
    </div>
);

const ReceiptItem = ({ item }) => (
    <div className="flex items-center gap-3 py-2">
        <img src={item.imageUrl || 'https://via.placeholder.com/48'} alt={item.name} className="w-10 h-10 rounded-md object-cover border"/>
        <div className="flex-grow">
            <p className="font-semibold text-gray-700">{item.name}</p>
            <p className="text-xs text-gray-500">{item.quantity} x {item.price.toFixed(2)}</p>
        </div>
        <p className="font-medium text-gray-800">{(item.price * item.quantity).toFixed(2)}</p>
    </div>
);

//================================================================================
// GLAVNA KOMPONENTA STRANICE
//================================================================================

export function OrderDetailPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

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

    const handleOpenRatingModal = () => setIsRatingModalOpen(true);
    const handleCloseRatingModal = () => setIsRatingModalOpen(false);
    const handleRatingSuccess = () => {
        setOrder(prevOrder => ({ ...prevOrder, rated: true }));
    };

    const statusInfo = useMemo(() => {
        if (!order) return {};
        const statuses = {
            'PENDING': { text: 'Order Placed', step: 1, color: 'text-blue-600' },
            'CONFIRMED': { text: 'Preparing Food', step: 2, color: 'text-yellow-600' },
            'PICKED_UP': { text: 'On The Way', step: 3, color: 'text-orange-600' },
            'DELIVERED': { text: 'Delivered Successfully', step: 4, color: 'text-green-600' },
            'CANCELED': { text: 'Canceled', step: 0, color: 'text-red-600' },
            'REJECTED': { text: 'Rejected', step: 0, color: 'text-red-600' },
        };
        return statuses[order.status] || { text: order.status.replace('_', ' '), step: 0, color: 'text-gray-600' };
    }, [order]);
    
    if (loading) return <OrderDetailPageSkeleton />;
    if (!order) return (
        <div className="w-full min-h-screen bg-[#F9F5EC] flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center text-center p-4">
                <div>
                    <h2 className="text-2xl font-bold">Order Not Found</h2>
                    <p className="text-gray-600">The requested order could not be loaded.</p>
                    <Button asChild className="mt-4 bg-brand-primary hover:bg-brand-primary/90"><Link to="/orders">Back to My Orders</Link></Button>
                </div>
            </div>
            <Footer />
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-[#F9F5EC] flex flex-col">
            <Navbar />
            <main className="container mx-auto px-4 md:px-6 py-12 flex-grow">
                <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-brand-primary hover:underline mb-8">
                    <ArrowLeft size={16} /> Back to My Orders
                </Link>

                <div className="text-center">
                    <p className={`font-bold text-lg ${statusInfo.color}`}>{statusInfo.text}</p>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mt-2">Order #{order.id}</h1>
                    <p className="text-lg text-gray-500 mt-1">from <span className="font-bold">{order.restaurantName}</span></p>
                </div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    className="my-12 bg-white p-6 rounded-2xl shadow-sm border"
                >
                    <div className="flex items-start">
                        <StatusStep icon={<CheckCircle/>} label="Placed" time={order.creationDate} isCompleted={statusInfo.step >= 1}/>
                        <div className={`flex-grow h-0.5 mt-6 transition-colors duration-500 ${statusInfo.step > 1 ? 'bg-brand-primary' : 'bg-gray-300'}`}></div>
                        <StatusStep icon={<CookingPot/>} label="Preparing" time={order.confirmedAt} isCompleted={statusInfo.step >= 2}/>
                        <div className={`flex-grow h-0.5 mt-6 transition-colors duration-500 ${statusInfo.step > 2 ? 'bg-brand-primary' : 'bg-gray-300'}`}></div>
                        <StatusStep icon={<Bike/>} label="On The Way" time={order.pickedUpAt} isCompleted={statusInfo.step >= 3}/>
                        <div className={`flex-grow h-0.5 mt-6 transition-colors duration-500 ${statusInfo.step > 3 ? 'bg-brand-primary' : 'bg-gray-300'}`}></div>
                        <StatusStep icon={<PackageCheck/>} label="Delivered" time={order.deliveredAt} isCompleted={statusInfo.step >= 4}/>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <InfoBlock icon={<Home size={22} />} title="Delivery & Payment">
                            <div><p className="font-semibold text-gray-800">Address:</p><p>{order.deliveryAddress || 'N/A'}</p></div>
                            <div><p className="font-semibold text-gray-800">Payment Method:</p><p className="capitalize">{(order.paymentMethod || '').toLowerCase()}</p></div>
                        </InfoBlock>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                         <div className="bg-white p-6 rounded-xl shadow-sm border h-full flex flex-col">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3"><FileText className="text-brand-primary"/> Receipt</h2>
                            
                            <div className="space-y-1 divide-y flex-grow max-h-72 overflow-y-auto pr-2">
                                {(order.items && Array.isArray(order.items) && order.items.length > 0) ? (
                                    order.items.map((item, index) => <ReceiptItem key={index} item={item} />)
                                ) : <p className="text-gray-500 pt-4">No items in this order.</p>}
                            </div>

                            <div className="border-t border-dashed my-4"></div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-gray-800">{(order.subtotal || 0).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Delivery Fee</span><span>{(order.deliveryPrice || 0).toFixed(2)}</span></div>
                                {order.couponCode && (<div className="flex justify-between text-green-600"><span>Discount ({order.couponCode})</span><span>-{(order.deliveryPrice || 0).toFixed(2)}</span></div>)}
                            </div>
                            <div className="border-t mt-4 pt-4">
                                <div className="flex justify-between font-bold text-lg text-brand-primary"><span>Total Paid</span><span>{(order.total || 0).toFixed(2)} RSD</span></div>
                            </div>
                            <div className="mt-6">
                                {order.status === 'PICKED_UP' && <Button asChild className="w-full bg-brand-primary hover:bg-brand-primary/90"><Link to={`/track/${order.id}`}><Map className="mr-2 h-4 w-4"/> Track Live</Link></Button>}
                                {order.status === 'DELIVERED' && 
                                    <Button 
                                        onClick={handleOpenRatingModal} 
                                        disabled={order.rated} 
                                        className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-70">
                                        <Star className="mr-2 h-4 w-4"/> {order.rated ? 'Rated' : 'Rate Order'}
                                    </Button>
                                }
                            </div>
                         </div>
                    </motion.div>
                </div>
            </main>
            <Footer />

            <RateOrderModal
                isOpen={isRatingModalOpen}
                onClose={handleCloseRatingModal}
                order={order}
                onRatingSuccess={handleRatingSuccess}
            />
        </div>
    );
}