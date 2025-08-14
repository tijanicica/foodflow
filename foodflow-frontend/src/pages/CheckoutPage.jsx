import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from 'react-hot-toast';
import { createOrder, getMyAddresses, getMyCoupons } from '@/services/api';
import { AddNewAddressModal } from '@/components/modals/AddNewAddressModal';
import { ScheduleDeliveryModal } from '@/components/modals/ScheduleDeliveryModal';
import { RepeatOrderModal } from '@/components/modals/RepeatOrderModal';
import { Loader2, X, Calendar, Repeat } from 'lucide-react';

// --- Pomoćne komponente (vraćene na vaš original) ---
const OrderItemRow = ({ item }) => (
    <div className="flex justify-between items-center py-2 border-b last:border-b-0">
        <span>{item.quantity} x {item.name}</span>
        <span className="font-medium text-[#4A4A4A]">{(item.price * item.quantity).toFixed(2)} RSD</span>
    </div>
);

const PriceSummary = ({ subtotal, deliveryFee, total, couponApplied }) => (
    <div className="space-y-2 mt-6 text-lg">
        <div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(2)} RSD</span></div>
        <div className="flex justify-between">
            <span>Delivery</span>
            <span className={couponApplied ? 'line-through text-gray-400' : ''}>{deliveryFee.toFixed(2)} RSD</span>
        </div>
        {couponApplied && <div className="flex justify-between text-green-600 font-bold"><span>Free Delivery</span><span>0.00 RSD</span></div>}
        <hr className="my-2 border-dashed" />
        <div className="flex justify-between font-bold text-xl"><span>Total</span><span>{total.toFixed(2)} RSD</span></div>
    </div>
);


// --- GLAVNA KOMPONENTA ---
export function CheckoutPage() {
    const { cartItems, restaurantInfo, clearCart } = useCart();
    const navigate = useNavigate();
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [savedCoupons, setSavedCoupons] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedCouponCode, setSelectedCouponCode] = useState('');
    const [noteForRestaurant, setNoteForRestaurant] = useState('');
    const [noteForDriver, setNoteForDriver] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Card');
    const [cardAmount, setCardAmount] = useState('');
    const [modalOpen, setModalOpen] = useState(null);
    const [scheduleInfo, setScheduleInfo] = useState(null);
    const [repeatInfo, setRepeatInfo] = useState(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
        if (!restaurantInfo || cartItems.length === 0) {
            navigate('/home', { replace: true });
            return;
        }
        const fetchInitialData = async () => {
            try {
                const [addresses, coupons] = await Promise.all([getMyAddresses(), getMyCoupons()]);
                setSavedAddresses(addresses);
                if (addresses.length > 0) { setSelectedAddressId(addresses[0].id.toString()); }
                setSavedCoupons(coupons);
            } catch (error) {
                toast.error("Could not load your data. Please try again.");
            }
        };
        fetchInitialData();
    }, [navigate, restaurantInfo, cartItems]);
    
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 150.0;
    const couponApplied = savedCoupons.some(c => c.code === selectedCouponCode);
    const total = couponApplied ? subtotal : subtotal + deliveryFee;
    const remainingCash = paymentMethod === 'Combined' && cardAmount ? (total - parseFloat(cardAmount)).toFixed(2) : 0;
    
    const handleAddressAdded = (newAddress) => {
        setSavedAddresses(prev => [...prev, newAddress]);
        setSelectedAddressId(newAddress.id.toString());
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) return toast.error("Please select a delivery address.");
        if (paymentMethod === 'Combined' && (!cardAmount || parseFloat(cardAmount) <= 0 || parseFloat(cardAmount) >= total)) {
             return toast.error("Please enter a valid amount for the card payment.");
        }
        const currentOrderType = scheduleInfo ? 'SCHEDULED' : repeatInfo ? 'REPEATING' : 'REGULAR';
        const orderData = { restaurantId: restaurantInfo.id, addressId: selectedAddressId, items: cartItems.map(item => ({ menuItemVersionId: item.id, quantity: item.quantity })), noteForRestaurant, noteForDriver, paymentType: paymentMethod.toUpperCase(), cardAmount: paymentMethod === 'Combined' ? parseFloat(cardAmount) : null, couponCode: couponApplied ? selectedCouponCode : null, orderType: currentOrderType, scheduleInfo: scheduleInfo, repeatInfo: repeatInfo };
        setIsPlacingOrder(true);
        try {
            await createOrder(orderData);
            toast.success('Order placed successfully!', { duration: 4000 });
            clearCart();
            setTimeout(() => { navigate('/orders?tab=Active'); }, 500);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to place order.");
            setIsPlacingOrder(false);
        }
    };
    
    if (!restaurantInfo) return null;

    return (
        <>
            <div className="w-full min-h-screen bg-[#F9F5EC] flex flex-col">
                <Navbar />
                <main className="container mx-auto px-4 py-8 flex-grow">
                     <div className="text-center mb-10">
                         <h1 className="text-4xl font-extrabold text-[#4A4A4A]">Complete Your Order</h1>
                         <p className="text-lg text-gray-500 mt-1">You're just a few clicks away from delicious food.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEVA KOLONA */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h2 className="text-2xl font-bold text-[#4A4A4A] mb-4">1. Delivery Details</h2>
                                {savedAddresses.length > 0 && selectedAddressId ? (
                                     <div>
                                        <Select onValueChange={setSelectedAddressId} value={selectedAddressId}>
                                            <SelectTrigger><SelectValue placeholder="Select from saved addresses..." /></SelectTrigger>
                                            <SelectContent>{savedAddresses.map(address => ( <SelectItem key={address.id} value={address.id.toString()}>{address.nickname ? `${address.nickname} - ` : ''}{address.street} {address.streetNumber}, {address.city}</SelectItem> ))}</SelectContent>
                                        </Select>
                                        <Button variant="link" className="p-0 h-auto mt-2 text-[#D4A056]" onClick={() => setModalOpen('address')}>+ Add New Address</Button>
                                    </div>
                                ) : (
                                    <div className="text-center p-4 border-2 border-dashed rounded-lg">
                                        <p className="text-gray-600 mb-2">Please add an address to continue.</p>
                                        <Button onClick={() => setModalOpen('address')} className="bg-[#D4A056] hover:bg-[#D4A056]/90">+ Add a New Address</Button>
                                    </div>
                                )}
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                               <h2 className="text-2xl font-bold text-[#4A4A4A] mb-4">2. Notes & Special Requests</h2>
                               <div className="space-y-4">
                                   <Textarea placeholder="Note for restaurant..." value={noteForRestaurant} onChange={e => setNoteForRestaurant(e.target.value)} />
                                   <Textarea placeholder="Note for driver..." value={noteForDriver} onChange={e => setNoteForDriver(e.target.value)} />
                               </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h2 className="text-2xl font-bold text-[#4A4A4A] mb-4">3. Order Options</h2>
                                
                                {/* === ISPRAVLJENI INFO-BOKS #1 === */}
                                {scheduleInfo && (
                                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md mb-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold">Scheduled Delivery</p>
                                            <p>{`Date: ${scheduleInfo.scheduledDate}, Time: ${scheduleInfo.scheduledTime}`}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScheduleInfo(null)}><X size={16} /></Button>
                                    </div>
                                )}

                                {/* === ISPRAVLJENI INFO-BOKS #2 === */}
                                {repeatInfo && (
                                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md mb-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold">Repeating Order</p>
                                            <p className="capitalize">{`Repeats ${repeatInfo.repeatType.toLowerCase()} on ${repeatInfo.dayOfWeek || repeatInfo.dayOfMonth.toLowerCase()} at ${repeatInfo.deliveryTime}`}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRepeatInfo(null)}><X size={16} /></Button>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <Button variant="outline" className="w-full" onClick={() => setModalOpen('schedule')} disabled={!!repeatInfo}>
                                        <Calendar className="mr-2 h-4 w-4"/> Schedule for Later
                                    </Button>
                                    <Button variant="outline" className="w-full" onClick={() => setModalOpen('repeat')} disabled={!!scheduleInfo}>
                                       <Repeat className="mr-2 h-4 w-4"/> Set Repeating Order
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* DESNA KOLONA (STICKY) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6 text-[#4A4A4A]">
                                <div className="bg-white p-6 rounded-xl shadow-sm">
                                    <h2 className="text-2xl font-bold mb-2">Your Order from</h2>
                                    <p className="text-[#D4A056] font-semibold mb-4 text-xl">{restaurantInfo.name}</p>
                                    <div className="max-h-60 overflow-y-auto pr-2">{cartItems.map(item => <OrderItemRow key={item.id} item={item} />)}</div>
                                    <div className="mt-4">
                                        {savedCoupons.length > 0 ? (
                                            <Select onValueChange={setSelectedCouponCode} value={selectedCouponCode}><SelectTrigger><SelectValue placeholder="Have a coupon?" /></SelectTrigger><SelectContent>{savedCoupons.map(coupon => <SelectItem key={coupon.id} value={coupon.code}>{coupon.code} - {coupon.description}</SelectItem>)}</SelectContent></Select>
                                        ) : ( <p className="text-sm text-center text-gray-500">No available coupons.</p> )}
                                    </div>
                                    <PriceSummary subtotal={subtotal} deliveryFee={deliveryFee} total={total} couponApplied={couponApplied} />
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm">
                                    <h2 className="text-2xl font-bold mb-4">4. Payment</h2>
                                    <div className="flex gap-2">
                                        {['Card', 'Cash', 'Combined'].map(method => (
                                            <Button key={method} variant={paymentMethod === method ? 'default' : 'outline'} onClick={() => setPaymentMethod(method)} className={`w-full ${paymentMethod === method ? 'bg-[#D4A056] hover:bg-[#D4A056]/90' : ''}`}>{method}</Button>
                                        ))}
                                    </div>
                                    {paymentMethod === 'Combined' && (
                                        <div className="mt-4">
                                            <label className="text-sm font-medium">Amount on card (RSD)</label>
                                            <Input type="number" placeholder="e.g., 1000" value={cardAmount} onChange={e => setCardAmount(e.target.value)} />
                                            {remainingCash > 0 && <p className="mt-1 text-sm text-gray-600">Remaining to pay in cash: <strong>{remainingCash} RSD</strong></p>}
                                        </div>
                                    )}
                                </div>
                                <Button className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700" onClick={handlePlaceOrder} disabled={isPlacingOrder || !selectedAddressId}>
                                    {isPlacingOrder ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Placing Order...</> : `Order Now (${total.toFixed(2)} RSD)`}
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* MODALI (Funkcionalnost nepromenjena) */}
            <AddNewAddressModal isOpen={modalOpen === 'address'} onClose={() => setModalOpen(null)} onAddressAdded={handleAddressAdded} />
            <ScheduleDeliveryModal isOpen={modalOpen === 'schedule'} onClose={() => setModalOpen(null)}
                onConfirm={(data) => {
                    setScheduleInfo(data); setRepeatInfo(null); setModalOpen(null);
                    toast.success('Delivery scheduled! Click "Order Now" to confirm.');
                }}
                openingTime={restaurantInfo?.openingTime} closingTime={restaurantInfo?.closingTime}
            />
            <RepeatOrderModal isOpen={modalOpen === 'repeat'} onClose={() => setModalOpen(null)}
                onSave={(data) => {
                    setRepeatInfo(data); setScheduleInfo(null); setModalOpen(null);
                    toast.success('Repetition set! Click "Order Now" to place the first order.');
                }}
                openingTime={restaurantInfo?.openingTime} closingTime={restaurantInfo?.closingTime}
            />
        </>
    );
}