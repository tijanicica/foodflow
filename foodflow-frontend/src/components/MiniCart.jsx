// Datoteka: src/components/MiniCart.jsx

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CartItem = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();
    return (
        <div className="flex items-center gap-4 py-4">
            <img src={item.imageUrl || 'https://via.placeholder.com/64'} alt={item.name} className="w-16 h-16 rounded-md object-cover border"/>
            <div className="flex-grow">
                <p className="font-semibold text-gray-800 leading-tight">{item.name}</p>
                <p className="text-sm text-brand-primary font-bold mt-1">{(item.price * item.quantity).toFixed(2)} RSD</p>
                <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14}/></Button>
                    <span className="font-bold w-6 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14}/></Button>
                </div>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 rounded-full" onClick={() => removeFromCart(item.id)}>
                <Trash2 size={18}/>
            </Button>
        </div>
    );
};

export const MiniCart = () => {
    const { isCartOpen, toggleCart, cartItems, restaurantInfo, subtotal, clearCart } = useCart();
    const navigate = useNavigate();
    const deliveryFee = 150.0;
    const total = subtotal + deliveryFee;

    const handleCheckout = () => {
        toggleCart(); // Prvo zatvori korpu
        navigate('/checkout'); // Onda navigiraj
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-[100]" // Visok z-index
                    onClick={toggleCart}
                >
                    <motion.div
                        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-2xl font-bold text-brand-primary flex items-center gap-3"><ShoppingCart/> Your Cart</h2>
                            <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleCart}><X/></Button>
                        </div>

                        {cartItems.length > 0 ? (
                            <>
                                <div className="flex-grow p-4 overflow-y-auto">
                                    <p className="font-semibold text-gray-700 mb-2">From: <span className="text-brand-primary">{restaurantInfo?.name || 'Restaurant'}</span></p>
                                    <div className="divide-y divide-dashed">
                                        {cartItems.map(item => <CartItem key={item.id} item={item}/>)}
                                    </div>
                                </div>
                                <div className="p-4 border-t bg-gray-50/70 space-y-4">
                                    <div className="space-y-1 text-md">
                                        <div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(2)} RSD</span></div>
                                        <div className="flex justify-between"><span>Delivery Fee</span><span>{deliveryFee.toFixed(2)} RSD</span></div>
                                        <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2"><span>Total</span><span>{total.toFixed(2)} RSD</span></div>
                                    </div>
                                    <Button onClick={handleCheckout} size="lg" className="w-full h-12 text-lg bg-brand-primary hover:bg-brand-primary/90">
                                        Proceed to Checkout
                                    </Button>
                                    <Button variant="link" className="w-full text-red-600" onClick={clearCart}>Clear Cart</Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                                <ShoppingCart size={64} className="text-gray-300"/>
                                <h3 className="text-xl font-bold mt-4">Your cart is empty</h3>
                                <p className="text-gray-500 mt-1">Add items from a restaurant to get started.</p>
                                <Button asChild className="mt-6 bg-brand-primary hover:bg-brand-primary/90"><Link to="/home" onClick={toggleCart}>Find Restaurants</Link></Button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};