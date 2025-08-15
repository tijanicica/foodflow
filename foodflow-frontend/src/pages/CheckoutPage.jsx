import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from 'react-hot-toast';
import { createOrder, getMyAddresses, getMyCoupons } from '@/services/api';
import { AddNewAddressModal } from '@/components/modals/AddNewAddressModal';
import { ScheduleDeliveryModal } from '@/components/modals/ScheduleDeliveryModal';
import { RepeatOrderModal } from '@/components/modals/RepeatOrderModal';
import { Loader2, X, Calendar, Repeat, PlusCircle, Home as HomeIcon, Briefcase, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from '@/components/Footer';

//================================================================================
// POMOĆNE KOMPONENTE (kompletne)
//================================================================================

const OrderItemRow = ({ item }) => (
    <div className="flex items-center gap-4 py-3">
        <img src={item.imageUrl || 'https://via.placeholder.com/64'} alt={item.name} className="w-14 h-14 rounded-md object-cover border"/>
        <div className="flex-grow">
            <p className="font-semibold text-gray-800">{item.name}</p>
            <p className="text-sm text-gray-500">{item.quantity} x {item.price.toFixed(2)} RSD</p>
        </div>
        <p className="font-semibold text-brand-primary">{(item.price * item.quantity).toFixed(2)} RSD</p>
    </div>
);

const AddressCard = ({ address, isSelected, onSelect }) => {
    const icons = { HOME: <HomeIcon/>, WORK: <Briefcase/>, OTHER: <Building/> };
    const normalizedNickname = address.nickname?.toUpperCase() || 'OTHER';
    const icon = icons[normalizedNickname] || icons.OTHER;
    return (
        <button onClick={onSelect} className={`w-full p-4 border-2 rounded-lg text-left transition-all flex items-center gap-4 ${isSelected ? 'border-brand-primary bg-brand-background-light' : 'border-gray-200 hover:border-gray-400'}`}>
            <div className={`p-2 rounded-full ${isSelected ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600'}`}>{icon}</div>
            <div>
                <p className="font-bold text-gray-800">{address.nickname || 'Address'}</p>
                <p className="text-sm text-gray-500">{address.street} {address.streetNumber}, {address.city}</p>
            </div>
        </button>
    );
};

const InfoBox = ({ type, text, onClear }) => (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
        className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 rounded-md flex justify-between items-center text-sm overflow-hidden">
        <div><p className="font-bold">{type} Order</p><p>{text}</p></div>
        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onClear}><X size={16} /></Button>
    </motion.div>
);

//================================================================================
// GLAVNA KOMPONENTA
//================================================================================
export function CheckoutPage() {
    const { cartItems, restaurantInfo, clearCart } = useCart();
    const navigate = useNavigate();
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [savedCoupons, setSavedCoupons] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedCouponCode, setSelectedCouponCode] = useState('');
    const [noteForRestaurant, setNoteForRestaurant] = useState('');
    const [noteForDriver, setNoteForDriver] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CARD');
    const [cardAmount, setCardAmount] = useState('');
    const [modalOpen, setModalOpen] = useState(null);
    const [scheduleInfo, setScheduleInfo] = useState(null);
    const [repeatInfo, setRepeatInfo] = useState(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    
    useEffect(() => {
        if (!restaurantInfo || cartItems.length === 0) {
            navigate('/home', { replace: true });
        }
    }, [cartItems, restaurantInfo, navigate]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [addresses, coupons] = await Promise.all([getMyAddresses(), getMyCoupons()]);
                setSavedAddresses(addresses);
                if (addresses.length > 0) setSelectedAddressId(addresses[0].id.toString());
                setSavedCoupons(coupons);
            } catch (error) { toast.error("Could not load your data. Please try again."); }
        };
        fetchInitialData();
    }, []);
    
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 150.0;
    const appliedCoupon = savedCoupons.find(c => c.code === selectedCouponCode);
    const total = appliedCoupon ? subtotal : subtotal + deliveryFee;
    const remainingCash = paymentMethod === 'COMBINED' && cardAmount ? (total - parseFloat(cardAmount)) : 0;
    
    const handleAddressAdded = (newAddress) => {
        setSavedAddresses(prev => [...prev, newAddress]);
        setSelectedAddressId(newAddress.id.toString());
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) return toast.error("Please select a delivery address.");
        if (paymentMethod === 'COMBINED' && (!cardAmount || parseFloat(cardAmount) <= 0 || parseFloat(cardAmount) >= total)) {
             return toast.error("Please enter a valid amount for card payment.");
        }
        const orderData = {
            restaurantId: restaurantInfo.id,
            addressId: selectedAddressId,
            items: cartItems.map(item => ({ menuItemVersionId: item.id, quantity: item.quantity })),
            noteForRestaurant, noteForDriver,
            paymentType: paymentMethod,
            cardAmount: paymentMethod === 'COMBINED' ? parseFloat(cardAmount) : null,
            couponCode: appliedCoupon ? selectedCouponCode : null,
            orderType: scheduleInfo ? 'SCHEDULED' : repeatInfo ? 'REPEATING' : 'REGULAR',
            scheduleInfo, repeatInfo,
        };
        setIsPlacingOrder(true);
        try {
            await createOrder(orderData);
            toast.success('Order placed successfully!', { duration: 4000 });
            clearCart();
            setTimeout(() => navigate('/orders?tab=Active'), 500);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to place order.");
        } finally {
            setIsPlacingOrder(false);
        }
    };
    
    if (!restaurantInfo) return null;

    return (
        <>
            <div className="w-full min-h-screen bg-[#F9F5EC] flex flex-col">
                <Navbar />
                <main className="container mx-auto px-4 py-12 flex-grow">
                     <div className="text-center mb-10">
                         <h1 className="text-5xl font-extrabold text-[#4A4A4A]">Complete Your Order</h1>
                         <p className="text-lg text-gray-500 mt-1">Review your details and place your order.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                        {/* LEVA KOLONA (Sadržaj koji se skroluje) */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h2 className="text-2xl font-bold text-[#4A4A4A] mb-4 flex items-center"><span className="bg-brand-primary text-white rounded-full h-8 w-8 text-lg flex items-center justify-center mr-3">1</span> Delivery Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {savedAddresses.map(addr => <AddressCard key={addr.id} address={addr} isSelected={selectedAddressId === addr.id.toString()} onSelect={() => setSelectedAddressId(addr.id.toString())}/>)}
                                </div>
                                <Button variant="link" className="p-0 h-auto mt-4 text-brand-primary" onClick={() => setModalOpen('address')}><PlusCircle size={16} className="mr-2"/> Add New Address</Button>
                            </div>
                            
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h2 className="text-2xl font-bold text-[#4A4A4A] mb-4 flex items-center"><span className="bg-brand-primary text-white rounded-full h-8 w-8 text-lg flex items-center justify-center mr-3">2</span> Payment & Options</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        {[{id: 'CARD', label: 'Card'}, {id: 'CASH', label: 'Cash'}, {id: 'COMBINED', label: 'Combined'}].map(method => (
                                            <Button key={method.id} variant={paymentMethod === method.id ? 'default' : 'outline'} onClick={() => setPaymentMethod(method.id)} className={`w-full h-12 text-md ${paymentMethod === method.id && 'bg-brand-primary hover:bg-brand-primary/90'}`}>{method.label}</Button>
                                        ))}
                                    </div>
                                    {paymentMethod === 'COMBINED' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            <Label>Amount on card (RSD)</Label>
                                            <Input type="number" placeholder="e.g., 1000" value={cardAmount} onChange={e => setCardAmount(e.target.value)} />
                                            {remainingCash > 0 && <p className="mt-1 text-sm text-gray-600">Remaining to pay in cash: <strong>{remainingCash.toFixed(2)} RSD</strong></p>}
                                        </motion.div>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                                        <Button variant="outline" className="w-full h-11" onClick={() => setModalOpen('schedule')} disabled={!!repeatInfo}><Calendar className="mr-2 h-4 w-4"/> Schedule</Button>
                                        <Button variant="outline" className="w-full h-11" onClick={() => setModalOpen('repeat')} disabled={!!scheduleInfo}><Repeat className="mr-2 h-4 w-4"/> Repeat</Button>
                                    </div>
                                    <AnimatePresence>
                                        {scheduleInfo && <InfoBox type="Scheduled" text={`On ${scheduleInfo.scheduledDate} at ${scheduleInfo.scheduledTime}`} onClear={() => setScheduleInfo(null)}/>}
                                        {repeatInfo && <InfoBox type="Repeating" text={`Repeats ${repeatInfo.repeatType.toLowerCase()}`} onClear={() => setRepeatInfo(null)}/>}
                                    </AnimatePresence>
                                </div>
                            </div>

                             <div className="bg-white p-6 rounded-xl shadow-sm">
                               <h2 className="text-2xl font-bold text-[#4A4A4A] mb-4 flex items-center"><span className="bg-brand-primary text-white rounded-full h-8 w-8 text-lg flex items-center justify-center mr-3">3</span> Notes</h2>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   <Textarea placeholder="Note for restaurant..." value={noteForRestaurant} onChange={e => setNoteForRestaurant(e.target.value)} />
                                   <Textarea placeholder="Note for driver..." value={noteForDriver} onChange={e => setNoteForDriver(e.target.value)} />
                               </div>
                            </div>
                        </div>

                        {/* DESNA KOLONA ("Lepljiva") */}
                        <aside className="lg:col-span-2 lg:sticky lg:top-24 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h2 className="text-2xl font-bold mb-2">Order Summary</h2>
                                <p className="text-brand-primary font-semibold mb-4 text-xl">from {restaurantInfo.name}</p>
                                <div className="max-h-64 overflow-y-auto divide-y divide-dashed pr-2">{cartItems.map(item => <OrderItemRow key={item.id} item={item} />)}</div>
                                
                                <div className="mt-4">
                                    {savedCoupons.length > 0 ? (
                                        <Select onValueChange={setSelectedCouponCode} value={selectedCouponCode}>
                                            <SelectTrigger><SelectValue placeholder="Have a coupon?" /></SelectTrigger>
                                            <SelectContent>
                                                {savedCoupons.map(coupon => (<SelectItem key={coupon.id} value={coupon.code}>{coupon.code} - {coupon.description}</SelectItem>))}
                                            </SelectContent>
                                        </Select>
                                    ) : ( <p className="text-sm text-center text-gray-500 py-2">No available coupons.</p> )}
                                </div>

                                <div className="space-y-2 mt-6 text-md border-t pt-4">
                                    <div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(2)} RSD</span></div>
                                    <div className="flex justify-between"><span>Delivery</span><span className={appliedCoupon ? 'line-through text-gray-400' : ''}>{deliveryFee.toFixed(2)} RSD</span></div>
                                    {appliedCoupon && <div className="flex justify-between text-green-600 font-bold"><span>Free Delivery ({appliedCoupon.code})</span><span>0.00 RSD</span></div>}
                                    <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2"><span>Total</span><span>{total.toFixed(2)} RSD</span></div>
                                </div>
                            </div>
                            <Button className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700" onClick={handlePlaceOrder} disabled={isPlacingOrder || !selectedAddressId}>
                                {isPlacingOrder ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Placing Order...</> : `Place Order (${total.toFixed(2)} RSD)`}
                            </Button>
                        </aside>
                    </div>
                </main>
                <Footer />
            </div>

            <AddNewAddressModal isOpen={modalOpen === 'address'} onClose={() => setModalOpen(null)} onAddressAdded={handleAddressAdded} />
            <ScheduleDeliveryModal isOpen={modalOpen === 'schedule'} onClose={() => setModalOpen(null)} onConfirm={(data) => { setScheduleInfo(data); setRepeatInfo(null); setModalOpen(null); toast.success('Delivery scheduled!'); }} openingTime={restaurantInfo?.openingTime} closingTime={restaurantInfo?.closingTime} />
            <RepeatOrderModal isOpen={modalOpen === 'repeat'} onClose={() => setModalOpen(null)} onSave={(data) => { setRepeatInfo(data); setScheduleInfo(null); setModalOpen(null); toast.success('Repetition set!'); }} openingTime={restaurantInfo?.openingTime} closingTime={restaurantInfo?.closingTime} />
        </>
    );
}