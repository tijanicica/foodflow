import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { getMyOrders, getMyRepeatingOrders, toggleRepeatingOrderStatus, cancelRepeatingOrder } from '@/services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom'; 
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';



// --- POMOĆNE FUNKCIJE ---

const formatStatus = (status) => {
    if (!status) return '';
    return status.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
};

const getStatusColor = (status) => {
    if (['DELIVERED', 'CONFIRMED'].includes(status)) return '#22C55E'; // green-500
    if (['CANCELED', 'REJECTED'].includes(status)) return '#EF4444'; // red-500
    if (['SCHEDULED_PENDING'].includes(status)) return '#3B82F6'; // blue-500
    return '#F97316'; // orange-500
};


// --- KOMPONENTE ZA PRIKAZ ---

const OrderCard = ({ order }) => {
    const isScheduled = order.status === 'SCHEDULED_PENDING';
    const dateToShow = isScheduled ? order.scheduledFor : order.creationDate;
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border grid grid-cols-12 items-center gap-y-3 gap-x-4">
            {/* Kolona 1: Ime i datum */}
            <div className="col-span-12 md:col-span-5">
                <h3 className="font-bold text-lg text-gray-800">{order.restaurantName}</h3>
                <p className="text-sm text-gray-500">
                    {isScheduled ? 'Scheduled for: ' : ''}
                    {format(new Date(dateToShow), 'MMM d, yyyy HH:mm')}
                </p>
            </div>
            
            {/* Kolona 2: Cena */}
            <div className="col-span-4 md:col-span-2 text-left md:text-right">
                {!isScheduled && (
                     <span className="font-medium text-lg text-gray-700">{order.totalPrice.toFixed(2)} RSD</span>
                )}
            </div>

            {/* Kolona 3: Status */}
            <div className="col-span-8 md:col-span-2 text-left md:text-center">
                 <p className="font-semibold" style={{ color: getStatusColor(order.status) }}>
                    Status: {formatStatus(order.status)}
                </p>
            </div>

            {/* Kolona 4: Dugmad */}
            <div className="col-span-12 md:col-span-3 flex justify-end gap-4">
               
                {order.status === 'PICKED_UP' && (
                    <Link to={`/track/${order.id}`}>
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700">
                            Track on map
                        </Button>
                    </Link>
                )}
               
                {order.status === 'DELIVERED' && (
                    <Button 
                        variant={order.rated ? "secondary" : "default"} 
                        size="sm"
                        disabled={order.rated}
                    className={`
                            px-6 
                            ${order.rated 
                                ? "cursor-not-allowed bg-gray-200 text-gray-500" 
                                : "bg-[#D4A056] hover:bg-[#c8924a] text-white"}
                        `}
                    >
                        {order.rated ? 'Rated' : 'Rate'}
                    </Button>
                )}
                <Link to={`/order/${order.id}`}>
                    <Button size="sm" className="bg-gray-800 hover:bg-gray-900 text-white">
                        View Details
                    </Button>
                </Link>
            </div>
        </div>
    );
};

const RepeatingOrderCard = ({ template, onUpdate, onRemove }) => {
    const [isConfirmOpen, setConfirmOpen] = useState(false);

    const endsText = template.unlimited ? 'Never' : `On ${format(new Date(template.repeatUntil), 'MMM d, yyyy')}`;
    
    const handleToggle = async () => {
        try {
            const updatedTemplate = await toggleRepeatingOrderStatus(template.id);
            onUpdate(updatedTemplate);
            toast.success(`Order status updated to ${updatedTemplate.active ? 'Active' : 'Paused'}`);
        } catch {
            toast.error("Failed to update status.");
        }
    };

    const handleCancelClick = () => {
        setConfirmOpen(true);
    };

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
            <div className="bg-white p-4 rounded-lg shadow-sm border grid grid-cols-12 items-center gap-y-3 gap-x-4">
                <div className="col-span-12 md:col-span-6">
                    <h3 className="font-bold text-lg text-gray-800">Repeating order from {template.restaurantName}</h3>
                    <p className="text-sm text-gray-500">
                        Every {template.dayOfWeek.toLowerCase()} at {template.deliveryTime}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Ends: {endsText}</p>
                </div>
                <div className="col-span-12 md:col-span-3 text-left md:text-center">
                    <p className={`font-bold ${template.active ? 'text-green-600' : 'text-gray-500'}`}>
                        Status: {template.active ? 'Active' : 'Paused'}
                    </p>
                </div>
              <div className="col-span-12 md:col-span-3 flex justify-end gap-4">
                    <Button variant="outline" size="sm" onClick={handleToggle}>
                        {template.active ? 'Pause' : 'Resume'}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleCancelClick}>
                        Cancel
                    </Button>
                    {/* NOVO: Link ka detaljima originalne porudžbine */}
                    <Link to={`/order/${template.originalOrderId}`}>
                        <Button size="sm" className="bg-gray-800 hover:bg-gray-900 text-white">
                           VIew Details
                        </Button>
                    </Link>
                </div>
            </div>

            <ConfirmDialog 
                isOpen={isConfirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmCancel}
                title="Cancel Repeating Order"
                description="Are you sure you want to permanently cancel this repeating order template? This action cannot be undone."
            />
        </>
    );
};

// --- GLAVNA KOMPONENTA STRANICE ---

export function MyOrdersPage() {
    // Definišemo tabove kao konstantu radi lakšeg snalaženja
    const TABS = [
        { label: 'Active', value: 'Active' },
        { label: 'Past Orders', value: 'Past' },
        { label: 'Scheduled', value: 'Scheduled' },
        { label: 'Repeating', value: 'Repeating' },
    ];

    const [searchParams] = useSearchParams();
    
    // 3. Proveravamo da li postoji 'tab' parametar, ako ne, podrazumevana vrednost je 'Active'
    const initialTab = searchParams.get('tab') || TABS[0].value;

    // 4. Inicijalizujemo stanje sa vrednošću iz URL-a
    const [activeTab, setActiveTab] = useState(initialTab);
    const [orders, setOrders] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'Repeating') {
                    setOrders([]); // Očisti stare podatke
                    const data = await getMyRepeatingOrders();
                    setTemplates(data);
                } else {
                    setTemplates([]); // Očisti stare podatke
                    // 'activeTab' sada direktno sadrži 'Active', 'Past', ili 'Scheduled'
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
    }, [activeTab]);

    const handleTemplateUpdate = (updatedTemplate) => {
        setTemplates(prevTemplates => 
            prevTemplates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t)
        );
    };

    const handleTemplateRemove = (templateId) => {
        setTemplates(prevTemplates => 
            prevTemplates.filter(t => t.id !== templateId)
        );
    };

    const renderContent = () => {
        if (loading) {
            return <p className="text-center text-gray-500 mt-8">Loading...</p>;
        }

        if (activeTab === 'Repeating') {
            return templates.length > 0
                ? templates.map(t => 
                    <RepeatingOrderCard 
                        key={t.id} 
                        template={t} 
                        onUpdate={handleTemplateUpdate} 
                        onRemove={handleTemplateRemove}
                    />)
                : <p className="text-center text-gray-500 mt-8">You have no repeating order templates.</p>;
        }

        return orders.length > 0
            ? orders.map(o => <OrderCard key={o.id} order={o} />)
            : <p className="text-center text-gray-500 mt-8">No orders found in this category.</p>;
    };

    return (
        <div className="w-full min-h-screen bg-[#F9F5EC]">
            <Navbar />
            <main className="container mx-auto px-4 md:px-6 py-8">
                <h1 className="text-4xl font-bold text-[#4A4A4A] mb-8">My Orders</h1>
                <div className="flex flex-wrap gap-x-8 gap-y-2 border-b mb-6">
                    {TABS.map(tab => (
                        <button 
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`py-2 font-semibold transition-colors duration-200 relative ${activeTab === tab.value ? 'text-[#4A4A4A]' : 'text-gray-500 hover:text-[#4A4A4A]'}`}
                        >
                            {tab.label}
                            {activeTab === tab.value && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4A056] rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>
                <div className="space-y-4">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}