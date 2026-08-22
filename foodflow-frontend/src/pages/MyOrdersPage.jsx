import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { getMyOrders, getMyRepeatingOrders, toggleRepeatingOrderStatus, cancelRepeatingOrder } from '@/services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { PackageOpen, Repeat, CalendarDays, Map, Star, Eye, PauseCircle, PlayCircle, Trash2 } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { RateOrderModal } from '@/components/modals/RateOrderModal';

// --- Pomoćne funkcije (ostaju iste) ---
const formatStatus = (status) => status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
const getStatusBadgeClasses = (status) => {
    if (['DELIVERED', 'CONFIRMED'].includes(status)) return 'bg-green-100 text-green-800';
    if (['CANCELED', 'REJECTED'].includes(status)) return 'bg-red-100 text-red-800';
    if (['SCHEDULED_PENDING'].includes(status)) return 'bg-blue-100 text-blue-800';
    if (['ACTIVE'].includes(status)) return 'bg-green-100 text-green-800';
    if (['PAUSED'].includes(status)) return 'bg-gray-100 text-gray-700';
    return 'bg-yellow-100 text-yellow-700';
};



const OrderCard = ({ order, onUpdate, onOpenCancelDialog, onOpenRatingModal }) => {
    const isRepeatingTemplate = !!order.repeatType;

    const handleToggle = async () => {
        try {
            const updated = await toggleRepeatingOrderStatus(order.id);
            onUpdate(updated);
            toast.success(`Order status updated to ${updated.active ? 'Active' : 'Paused'}`);
        } catch { 
            toast.error("Failed to update status."); 
        }
    };

    const getRepeatText = () => {
        if (order.repeatType === 'WEEKLY') return `Every ${order.dayOfWeek.toLowerCase()}`;
        if (order.repeatType === 'MONTHLY') return `On the ${order.dayOfMonth.toLowerCase().replace('_', ' ')} of the month`;
        return 'Repeating';
    };

    const dateToShow = order.status === 'SCHEDULED_PENDING' ? order.scheduledFor : order.creationDate;

    return (
        <motion.div 
            layout 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl shadow-sm border flex flex-col transition-shadow hover:shadow-lg"
        >
            <div className="relative">
                <img 
                    src={order.restaurantImageUrl || 'https://via.placeholder.com/400x200?text=FoodFlow'} 
                    alt={order.restaurantName} 
                    className="w-full h-36 object-cover rounded-t-xl"
                />
                <div className="absolute inset-0 bg-black/20 rounded-t-xl"></div>
                <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full shadow-md ${getStatusBadgeClasses(isRepeatingTemplate ? (order.active ? 'ACTIVE' : 'PAUSED') : order.status)}`}>
                        {formatStatus(isRepeatingTemplate ? (order.active ? 'Active' : 'Paused') : order.status)}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-grow flex flex-col">
                <div className="flex-grow">
                    <p className="font-bold text-lg text-brand-primary">{order.restaurantName}</p>
                    <p className="text-xs text-gray-500 mb-3">{isRepeatingTemplate ? `Template ID #${order.id}` : `Order #${order.id}`}</p>
                    {isRepeatingTemplate ? (
                        <div className="space-y-1.5 text-sm text-gray-600">
                            <div className="flex items-center"><Repeat className="mr-2 h-4 w-4 text-brand-primary/70"/><span>{getRepeatText()} at {order.deliveryTime}</span></div>
                            <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-brand-primary/70"/><span>Ends: {order.unlimited ? 'Never' : format(new Date(order.repeatUntil), 'MMM d, yyyy')}</span></div>
                        </div>
                    ) : (
                        <div className="space-y-1.5 text-sm text-gray-600">
                            <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-brand-primary/70"/><span>{order.status === 'SCHEDULED_PENDING' ? 'Scheduled: ' : 'Ordered: '} {format(new Date(dateToShow), 'MMM d, yyyy HH:mm')}</span></div>
                            {order.totalPrice && <div className="font-semibold text-gray-800"><span>Total: {order.totalPrice.toFixed(2)} RSD</span></div>}
                        </div>
                    )}
                </div>

                <div className="mt-5 pt-4 border-t border-dashed flex items-center gap-2">
                    <Button asChild variant="secondary" size="sm" className="flex-grow justify-center">
                        <Link to={`/order/${isRepeatingTemplate ? order.originalOrderId : order.id}`}><Eye className="mr-2 h-4 w-4"/> Details</Link>
                    </Button>
                    
                    {isRepeatingTemplate ? (
                        <>
                            <Button onClick={handleToggle} variant="outline" size="sm" className="flex-grow justify-center">
                                {order.active ? <><PauseCircle className="mr-2 h-4 w-4"/> Pause</> : <><PlayCircle className="mr-2 h-4 w-4"/> Resume</>}
                            </Button>
                            <Button onClick={() => onOpenCancelDialog(order.id)} variant="destructive" size="icon" className="flex-shrink-0">
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </>
                    ) : (
                        <>
                            {order.status === 'PICKED_UP' && <Button asChild variant="outline" size="sm" className="flex-grow justify-center"><Link to={`/track/${order.id}`}><Map className="mr-2 h-4 w-4"/> Track</Link></Button>}
                            
                            {/* === AŽURIRANO DUGME === */}
                            {order.status === 'DELIVERED' && 
                                <Button 
                                    size="sm" 
                                    disabled={order.rated} 
                                    onClick={onOpenRatingModal} // Povezano sa funkcijom iz MyOrdersPage
                                    className="flex-grow justify-center bg-brand-primary hover:bg-brand-primary/90 disabled:bg-gray-300">
                                    <Star className="mr-2 h-4 w-4"/> {order.rated ? 'Rated' : 'Rate'}
                                </Button>
                            }
                            {/* ======================= */}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const OrderCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border animate-pulse overflow-hidden">
        <div className="w-full h-36 bg-gray-200"></div>
        <div className="p-5">
            <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-1/4 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2"><div className="h-4 w-full bg-gray-200 rounded"></div><div className="h-4 w-2/3 bg-gray-200 rounded"></div></div>
            <div className="mt-5 pt-4 border-t border-dashed flex justify-end gap-2">
                <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
                <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
            </div>
        </div>
    </div>
);
const EmptyState = ({ message, tab }) => (
    <motion.div 
        className="col-span-full h-full min-h-[40vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl border-2 border-dashed" 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
    >
        <PackageOpen className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-2xl font-semibold text-gray-800">No {tab} Orders Found</h3>
        <p className="mt-2 max-w-sm text-gray-500">{message}</p>
        <Button asChild className="mt-6 bg-brand-primary hover:bg-brand-primary/90 text-lg px-6 py-6">
            <Link to="/home">Start a New Order</Link>
        </Button>
    </motion.div>
);


const TABS = [
    { label: 'Active', value: 'Active' },
    { label: 'Past Orders', value: 'Past' },
    { label: 'Scheduled', value: 'Scheduled' },
    { label: 'Repeating', value: 'Repeating' },
];

//================================================================================
// GLAVNA KOMPONENTA STRANICE
//================================================================================

export function MyOrdersPage() {
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [orderToRate, setOrderToRate] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || TABS[0].value);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogState, setDialogState] = useState({ isOpen: false, itemToDelete: null });
    const [isDeleting, setIsDeleting] = useState(false);

     const handleOpenRatingModal = (order) => {
        setOrderToRate(order);
        setIsRatingModalOpen(true);
    };

    const handleCloseRatingModal = () => {
        setIsRatingModalOpen(false);
        setOrderToRate(null);
    };
     const handleRatingSuccess = (ratedOrderId) => {
        setData(prevData =>
            prevData.map(order =>
                order.id === ratedOrderId ? { ...order, rated: true } : order
            )
        );
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const result = activeTab === 'Repeating' ? await getMyRepeatingOrders() : await getMyOrders(activeTab);
            setData(result);
        } catch (error) { toast.error("Failed to fetch data. Please try again."); setData([]); } 
        finally { setLoading(false); }
    }, [activeTab]);

    useEffect(() => {
        setSearchParams({ tab: activeTab }, { replace: true });
        fetchData();
    }, [activeTab, setSearchParams, fetchData]);

    const handleUpdate = (updatedItem) => setData(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    const handleOpenConfirmDialog = (itemId) => { setDialogState({ isOpen: true, itemToDelete: itemId }); };
    const handleCloseConfirmDialog = () => { if (!isDeleting) { setDialogState({ isOpen: false, itemToDelete: null }); } };
    const handleConfirmDelete = async () => {
        if (!dialogState.itemToDelete) return;
        setIsDeleting(true);
        try {
            await cancelRepeatingOrder(dialogState.itemToDelete);
            toast.success("Repeating order cancelled.");
            setData(prevData => prevData.filter(item => item.id !== dialogState.itemToDelete));
            handleCloseConfirmDialog();
        } catch { 
            toast.error("Failed to cancel order."); 
        } finally { 
            setIsDeleting(false);
        }
    };
    
    return (
        <div className="w-full min-h-screen bg-[#F9F5EC] flex flex-col">
            <Navbar />
            <main className="container mx-auto px-4 md:px-6 py-12 flex-grow">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-extrabold text-[#4A4A4A]">My Orders</h1>
                    <p className="text-lg text-gray-500 mt-1">Track your deliveries and manage your order history.</p>
                </div>
                
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1 rounded-full shadow-sm flex gap-1 border">
                        {TABS.map(tab => (
                            <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${activeTab === tab.value ? 'bg-brand-primary text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[50vh]">
                    <AnimatePresence>
                        {loading ? (
                            [...Array(4)].map((_, i) => <OrderCardSkeleton key={i} />)
                        ) : data.length > 0 ? (
                            data.map(item => (
                                <OrderCard 
                                    key={item.id} 
                                    order={item} 
                                    onUpdate={handleUpdate} 
                                    onOpenCancelDialog={handleOpenConfirmDialog}
                                     onOpenRatingModal={() => handleOpenRatingModal(item)}
                                />
                            ))
                        ) : (
                           <EmptyState message={`You currently don't have any ${activeTab.toLowerCase()} orders.`} tab={activeTab} />
                        )}
                    </AnimatePresence>
                </div>
            </main>
            <Footer />

            <ConfirmDialog 
                isOpen={dialogState.isOpen} 
                onClose={handleCloseConfirmDialog} 
                onConfirm={handleConfirmDelete} 
                title="Cancel Repeating Order" 
                description="This action cannot be undone. Are you sure?"
                isLoading={isDeleting}
            />

            <RateOrderModal 
                isOpen={isRatingModalOpen}
                onClose={handleCloseRatingModal}
                order={orderToRate}
                onRatingSuccess={handleRatingSuccess}
            />
        </div>
    );
}