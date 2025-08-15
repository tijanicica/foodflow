// Datoteka: src/context/CartContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('foodFlowCart');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Error parsing cart from localStorage", error);
            return [];
        }
    });
    
    const [restaurantInfo, setRestaurantInfo] = useState(() => {
        try {
            const localData = localStorage.getItem('foodFlowRestaurant');
            return localData ? JSON.parse(localData) : null;
        } catch (error) {
            console.error("Error parsing restaurant info from localStorage", error);
            return null;
        }
    });
    
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('foodFlowCart', JSON.stringify(cartItems));
            localStorage.setItem('foodFlowRestaurant', JSON.stringify(restaurantInfo));
        } catch (error) {
            console.error("Error saving to localStorage", error);
        }
    }, [cartItems, restaurantInfo]);

    const addToCart = (item, quantity, restaurant) => {
        if (restaurantInfo && restaurantInfo.id !== restaurant.id) {
            toast.error("You can only order from one restaurant at a time. Please clear your cart first.", { id: 'cart-error' });
            return;
        }
        if (!restaurantInfo) setRestaurantInfo(restaurant);

        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === item.id);
            if (existingItem) {
                return prevItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
            }
            return [...prevItems, { ...item, quantity }];
        });
        toast.success(`${quantity} x ${item.name} added to cart!`);
        setIsCartOpen(true);
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => {
            const newCart = prev.filter(item => item.id !== itemId);
            if (newCart.length === 0) {
                setRestaurantInfo(null);
            }
            return newCart;
        });
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }
        setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
    };

    const clearCart = () => {
        setCartItems([]);
        setRestaurantInfo(null);
        setIsCartOpen(false);
        toast.success("Cart has been cleared.");
    };

    const toggleCart = () => setIsCartOpen(prev => !prev);

    const value = {
        cartItems,
        restaurantInfo,
        addToCart,
        clearCart,
        updateQuantity,
        removeFromCart,
        isCartOpen,
        toggleCart,
        totalItemsInCart: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};