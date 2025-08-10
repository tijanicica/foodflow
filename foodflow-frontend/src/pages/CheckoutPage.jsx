import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from 'react-hot-toast';
import { createOrder, getMyAddresses, getMyCoupons } from '@/services/api';

// Uvezi modale
import { AddNewAddressModal } from '@/components/modals/AddNewAddressModal';
import { ScheduleDeliveryModal } from '@/components/modals/ScheduleDeliveryModal';
import { RepeatOrderModal } from '@/components/modals/RepeatOrderModal';

// Pomoćne komponente za prikaz
const OrderItemRow = ({ item }) => (
    <div className="flex justify-between items-center py-2 border-b last:border-b-0">
        <span>{item.quantity} x {item.name}</span>
        <span className="font-medium">{(item.price * item.quantity).toFixed(2)} RSD</span>
    </div>
);

const PriceSummary = ({ subtotal, deliveryFee, total, couponApplied }) => (
    <div className="space-y-2 mt-6 text-lg">
        <div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(2)} RSD</span></div>
        <div className="flex justify-between"><span>Delivery</span><span className={couponApplied ? 'line-through text-gray-400' : ''}>{deliveryFee.toFixed(2)} RSD</span></div>
        {couponApplied && <div className="flex justify-between text-green-600 font-bold"><span>Free Delivery</span><span>0.00 RSD</span></div>}
        <hr className="my-2 border-dashed" />
        <div className="flex justify-between font-bold text-xl"><span>Total</span><span>{total.toFixed(2)} RSD</span></div>
    </div>
);

export function CheckoutPage() {
    const { cartItems, restaurantInfo, clearCart } = useCart();
    const navigate = useNavigate();

    // Stanje podataka sa servera
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [savedCoupons, setSavedCoupons] = useState([]);

    // Stanje forme
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedCouponCode, setSelectedCouponCode] = useState('');
    const [noteForRestaurant, setNoteForRestaurant] = useState('');
    const [noteForDriver, setNoteForDriver] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Card');
    const [cardAmount, setCardAmount] = useState('');
    
    // Stanje za modale i specijalne porudžbine
    const [modalOpen, setModalOpen] = useState(null);
    const [orderType, setOrderType] = useState('REGULAR');
    const [scheduleInfo, setScheduleInfo] = useState(null);
    const [repeatInfo, setRepeatInfo] = useState(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const fetchInitialData = useCallback(async () => {
        try {
            const [addresses, coupons] = await Promise.all([getMyAddresses(), getMyCoupons()]);
            setSavedAddresses(addresses);
            setSavedCoupons(coupons);
        } catch (error) {
            toast.error("Could not load your data. Please try again.");
        }
    }, []);

    ///
  const isRedirecting = React.useRef(false);

    useEffect(() => {
        // Ako je preusmeravanje već pokrenuto, ne radi ništa
        if (isRedirecting.current) return;

        // Ako korpa postane prazna (ili je bila prazna), pokreni preusmeravanje
        if (!restaurantInfo || cartItems.length === 0) {
            // Prikazujemo poruku samo ako nismo na početnom renderovanju 
            // i ako restoran postoji (što znači da je korpa upravo ispražnjena)
            if (restaurantInfo) { 
                toast.error("Your cart is empty!");
            }
            isRedirecting.current = true; // Označi da je preusmeravanje počelo
            navigate('/home', { replace: true });
        } else {
            // Ako je korpa puna, normalno učitaj podatke
            fetchInitialData();
        }
    }, [restaurantInfo, cartItems, navigate, fetchInitialData]);

    ////

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

        const orderData = {
            restaurantId: restaurantInfo.id,
            addressId: selectedAddressId,
            items: cartItems.map(item => ({ menuItemVersionId: item.id, quantity: item.quantity })),
            noteForRestaurant,
            noteForDriver,
            paymentType: paymentMethod.toUpperCase(),
            cardAmount: paymentMethod === 'Combined' ? cardAmount : null,
            couponCode: couponApplied ? selectedCouponCode : null,
            orderType,
            scheduleInfo: orderType === 'SCHEDULED' ? scheduleInfo : null,
            repeatInfo: orderType === 'REPEATING' ? repeatInfo : null
        };

        setIsPlacingOrder(true);
        try {
            await createOrder(orderData);
            toast.success("Order placed successfully!");
            clearCart();
            navigate('/orders');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to place order.");
        } finally {
            setIsPlacingOrder(false);
        }
    };
    
    if (!restaurantInfo) return null;

    return (
        <>
            <div className="w-full min-h-screen bg-[#F9F5EC]">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    <h1 className="text-4xl font-bold text-[#4A4A4A] mb-8">Checkout</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* LEVA KOLONA */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-2xl font-semibold text-[#4A4A4A]">Your Order from <span className="text-[#D4A056]">{restaurantInfo.name}</span></h2>
                                <p className="text-gray-500">{restaurantInfo.address || 'Kralja Petra 12, Beograd'}</p>
                                <div className="mt-4 space-y-3 pt-4">
                                    {cartItems.map(item => <OrderItemRow key={item.id} item={item} />)}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-2xl font-semibold text-[#4A4A4A]">Delivery Address</h2>
                                <Select onValueChange={setSelectedAddressId} value={selectedAddressId}>
                                    <SelectTrigger><SelectValue placeholder="Select from saved addresses..." /></SelectTrigger>
                                    <SelectContent>
                                        {savedAddresses.map(address => (
                                            <SelectItem key={address.id} value={address.id.toString()}>
                                                {address.nickname ? `${address.nickname} - ` : ''} 
                                                {address.street} {address.streetNumber}, {address.city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="link" className="p-0 h-auto mt-2 text-[#D4A056]" onClick={() => setModalOpen('address')}>+ Add a new address</Button>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-2xl font-semibold text-[#4A4A4A]">Notes</h2>
                                <div className="space-y-4">
                                   <Textarea placeholder="Note for restaurant..." value={noteForRestaurant} onChange={e => setNoteForRestaurant(e.target.value)} />
                                   <Textarea placeholder="Note for driver..." value={noteForDriver} onChange={e => setNoteForDriver(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* DESNA KOLONA */}
                        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                               {savedCoupons.length > 0 ? (
                                <Select onValueChange={setSelectedCouponCode} value={selectedCouponCode}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your coupon..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {savedCoupons.map(coupon => (
                                            <SelectItem key={coupon.id} value={coupon.code}>{coupon.code}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                // Prikaz ako nema dostupnih kupona
                                <div className="text-center text-gray-500 border rounded-md p-2">
                                    No available coupons
                                </div>
                            )}


                            <p className="text-xs text-gray-400 mt-1">Note: One-time coupons apply to the first order of a repeating series.</p>
                            
                            <h3 className="text-xl font-semibold mt-6 mb-2 text-[#4A4A4A]">Price Summary</h3>
                            <PriceSummary subtotal={subtotal} deliveryFee={deliveryFee} total={total} couponApplied={couponApplied} />

                            <h3 className="text-xl font-semibold mt-6 mb-2 text-[#4A4A4A]">Payment Method</h3>
                            <div className="flex gap-2">
                               {['Card', 'Cash', 'Combined'].map(method => (
                                   <Button key={method} variant={paymentMethod === method ? 'default' : 'outline'} onClick={() => setPaymentMethod(method)}>{method}</Button>
                               ))}
                            </div>
                            
                            {paymentMethod === 'Combined' && (
                                <div className="mt-4">
                                    <label>Amount on card:</label>
                                    <Input type="number" placeholder="1000" value={cardAmount} onChange={e => setCardAmount(e.target.value)} />
                                    <p className="mt-1 text-gray-600">Remaining (cash): {remainingCash > 0 ? `${remainingCash} RSD` : '0.00 RSD'}</p>
                                </div>
                            )}

                            <div className="mt-8 flex gap-2">
                               <Button variant="outline" className="w-full" onClick={() => setModalOpen('schedule')}>Schedule</Button>
                               <Button variant="outline" className="w-full" onClick={() => setModalOpen('repeat')}>Repeat</Button>
                               <Button className="w-full" onClick={handlePlaceOrder} disabled={isPlacingOrder}>{isPlacingOrder ? 'Placing...' : 'Order Now'}</Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* MODALI */}
            <AddNewAddressModal 
                isOpen={modalOpen === 'address'} 
                onClose={() => setModalOpen(null)}
                onAddressAdded={handleAddressAdded}
            />
            <ScheduleDeliveryModal 
            isOpen={modalOpen === 'schedule'} 
            onClose={() => setModalOpen(null)}
            onConfirm={(data) => {
                setScheduleInfo(data);
                setOrderType('SCHEDULED');
                setModalOpen(null);
                toast.success('Delivery scheduled! Click "Order Now" to confirm.');
            }}
            // === KLJUČNA IZMENA ===
            // Prosleđujemo radno vreme iz korpe u modal
            openingTime={restaurantInfo?.openingTime}
            closingTime={restaurantInfo?.closingTime}
        />
            <RepeatOrderModal 
                 isOpen={modalOpen === 'repeat'} 
                openingTime={restaurantInfo?.openingTime}
                closingTime={restaurantInfo?.closingTime}

                 onClose={() => setModalOpen(null)}
                 onSave={(data) => {
                    setRepeatInfo(data);
                    setOrderType('REPEATING');
                    setModalOpen(null);
                    toast.success('Repetition set! Click "Order Now" to place the first order.');
                 }}
            />
        </>
    );
}