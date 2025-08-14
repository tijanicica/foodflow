import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { getMyOrders, getMyRepeatingOrders, toggleRepeatingOrderStatus, cancelRepeatingOrder } from '@/services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { PackageOpen, Repeat, CalendarDays, Map, Star, Eye } from 'lucide-react';
import { Footer } from '@/components/Footer'; // <-- 1. UVOZ FUTERA


// --- POMOĆNE FUNKCIJE ---
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


// --- KOMPONENTE ZA PRIKAZ ---

const OrderCard = ({ order }) => {
    const isScheduled = order.status === 'SCHEDULED_PENDING';
    const dateToShow = isScheduled ? order.scheduledFor : order.creationDate;
    
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-grow">
                <h3 className="font-bold text-lg text-gray-800">{order.restaurantName}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>
                        {isScheduled ? 'Scheduled for: ' : 'Ordered on: '}
                        {format(new Date(dateToShow), 'MMM d, yyyy HH:mm')}
                    </span>
                    {!isScheduled && (
                        <span className="font-semibold text-gray-700">| {order.totalPrice.toFixed(2)} RSD</span>
                    )}
                </div>
                 <div className={`mt-2 inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(order.status)}`}>
                    {formatStatus(order.status)}
                </div>
            </div>
            
            <div className="flex items-center gap-2 self-start md:self-center">
                {order.status === 'PICKED_UP' && (
                    <Link to={`/track/${order.id}`}>
                        <Button variant="outline" size="sm"><Map className="mr-2 h-4 w-4"/> Track</Button>
                    </Link>
                )}
                {order.status === 'DELIVERED' && (
                    <Button 
                        size="sm"
                        disabled={order.rated}
                        className={`transition-colors ${order.rated ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-[#D4A056] hover:bg-[#c8924a]"}`}
                    >
                        <Star className="mr-2 h-4 w-4"/> {order.rated ? 'Rated' : 'Rate'}
                    </Button>
                )}
                <Link to={`/order/${order.id}`}>
                    <Button variant="secondary" size="sm"><Eye className="mr-2 h-4 w-4"/> Details</Button>
                </Link>
            </div>
        </div>
    );
};

const RepeatingOrderCard = ({ template, onUpdate, onRemove }) => {
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const endsText = template.unlimited ? 'Never' : `On ${format(new Date(template.repeatUntil), 'MMM d, yyyy')}`;
    
    // Funkcija koja ispravno bira tekst na osnovu tipa ponavljanja
    const getRepeatText = () => {
        if (template.repeatType === 'WEEKLY' && template.dayOfWeek) {
            return `Every ${template.dayOfWeek.toLowerCase()}`;
        }
        if (template.repeatType === 'MONTHLY' && template.dayOfMonth) {
            const day = template.dayOfMonth.toLowerCase().replace('_', ' ');
            return `On the ${day} of the month`;
        }
        return 'Repeating'; // Osiguranje od greške ako podaci nisu ispravni
    };

    const handleToggle = async () => {
        try {
            const updatedTemplate = await toggleRepeatingOrderStatus(template.id);
            onUpdate(updatedTemplate);
            toast.success(`Order status updated to ${updatedTemplate.active ? 'Active' : 'Paused'}`);
        } catch {
            toast.error("Failed to update status.");
        }
    };

    const handleCancelClick = () => setConfirmOpen(true);

    const handleConfirmCancel = async () => {
        try {
            await cancelRepeatingOrder(template.id);
            onRemove(template.id);
            toast.success("Repeating order cancelled.");
        } catch {
            toast.error("Failed to cancel order.");
        } finally {
            setConfirmOpen(false);
        }
    };
    
    return (
        <>
            <div className="bg-white p-5 rounded-xl shadow-sm border flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-grow">
                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${template.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {template.active ? 'Active' : 'Paused'}
                        </span>
                        <h3 className="font-bold text-lg text-gray-800">from {template.restaurantName}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                        {/* Ovde se poziva ispravna funkcija */}
                        <span className="flex items-center capitalize"><Repeat className="mr-1.5 h-4 w-4"/> {getRepeatText()} at {template.deliveryTime}</span>
                        <span className="flex items-center"><CalendarDays className="mr-1.5 h-4 w-4"/> Ends: {endsText}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start md:self-center">
                    <Button variant="outline" size="sm" onClick={handleToggle}>{template.active ? 'Pause' : 'Resume'}</Button>
                    <Button variant="destructive" size="sm" onClick={handleCancelClick}>Cancel</Button>
                    <Link to={`/order/${template.originalOrderId}`}>
                        <Button variant="secondary" size="sm"><Eye className="mr-2 h-4 w-4"/> Details</Button>
                    </Link>
                </div>
            </div>
            <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirmCancel} title="Cancel Repeating Order" description="Are you sure you want to permanently cancel this repeating order template? This action cannot be undone."/>
        </>
    );
};

// --- SKELETON I EMPTY STATE KOMPONENTE ---

const OrderCardSkeleton = () => (
    <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4 animate-pulse">
        <div className="flex-grow space-y-3">
            <div className="h-5 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
            <div className="h-5 w-1/4 bg-gray-200 rounded-full"></div>
        </div>
        <div className="flex gap-2">
            <div className="h-9 w-24 bg-gray-200 rounded-md"></div>
            <div className="h-9 w-24 bg-gray-200 rounded-md"></div>
        </div>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="text-center py-16 px-6 bg-white rounded-xl border border-dashed">
        <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-xl font-semibold text-gray-800">Nothing to see here</h3>
        <p className="mt-1 text-gray-500">{message}</p>
        <Link to="/home">
            <Button className="mt-6 bg-[#D4A056] hover:bg-[#c8924a]">Start Ordering</Button>
        </Link>
    </div>
);


// --- GLAVNA KOMPONENTA STRANICE ---

export function MyOrdersPage() {
    const TABS = [
        { label: 'Active', value: 'Active' },
        { label: 'Past Orders', value: 'Past' },
        { label: 'Scheduled', value: 'Scheduled' },
        { label: 'Repeating', value: 'Repeating' },
    ];
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || TABS[0].value;
    const [activeTab, setActiveTab] = useState(initialTab);
    const [orders, setOrders] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setSearchParams({ tab: activeTab }, { replace: true });

        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'Repeating') {
                    setOrders([]);
                    const data = await getMyRepeatingOrders();
                    setTemplates(data);
                } else {
                    setTemplates([]);
                    const data = await getMyOrders(activeTab);
                    setOrders(data);
                }
            } catch (error) {
                toast.error("Failed to fetch data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab, setSearchParams]);

    const handleTemplateUpdate = (updatedTemplate) => {
        setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    };

    const handleTemplateRemove = (templateId) => {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
    };

    const renderContent = () => {
        if (loading) {
            return <div className="space-y-4">{[...Array(3)].map((_, i) => <OrderCardSkeleton key={i} />)}</div>;
        }

        if (activeTab === 'Repeating') {
            return templates.length > 0
                ? templates.map(t => <RepeatingOrderCard key={t.id} template={t} onUpdate={handleTemplateUpdate} onRemove={handleTemplateRemove}/>)
                : <EmptyState message="You have no repeating order templates." />;
        }

        return orders.length > 0
            ? orders.map(o => <OrderCard key={o.id} order={o} />)
            : <EmptyState message="No orders found in this category." />;
    };

    return (
        <div className="w-full min-h-screen bg-[#F9F5EC]">
            <Navbar />
            <main className="container mx-auto px-4 md:px-6 py-8">
                <h1 className="text-4xl font-bold text-[#4A4A4A] mb-8">My Orders</h1>
                
                <div className="bg-white p-1 rounded-lg shadow-sm inline-flex gap-1 mb-6">
                    {TABS.map(tab => (
                        <button 
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tab.value ? 'bg-[#D4A056] text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {renderContent()}
                </div>
            </main>
                        <Footer /> {/* <-- 2. DODAVANJE FUTERA NA DNO STRANICE */}
            
        </div>
    );
}