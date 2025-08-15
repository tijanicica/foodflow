import React, { createContext, useState, useContext } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [restaurantInfo, setRestaurantInfo] = useState(null);

    const addToCart = (item, quantity, restaurant) => {
        // Pravilo: Može se poručivati samo iz jednog restorana odjednom
        if (restaurantInfo && restaurantInfo.id !== restaurant.id) {
            toast.error("You can only order from one restaurant at a time. Please clear your cart to start a new order.");
            return;
        }

        // Ako je korpa prazna, postavi informacije o restoranu
        if (!restaurantInfo) {
            setRestaurantInfo(restaurant);
        }

        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === item.id);
            if (existingItem) {
                // Ako stavka već postoji, samo ažuriraj količinu
                return prevItems.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
                );
            }
            // Ako je nova stavka, dodaj je u korpu
            return [...prevItems, { ...item, quantity }];
        });

        toast.success(`${quantity} x ${item.name} added to cart!`);
    };

    const clearCart = () => {
        setCartItems([]);
        setRestaurantInfo(null);
    };

    // Ovde možete dodati i funkcije za removeFromCart, updateQuantity itd.

    const value = {
        cartItems,
        restaurantInfo,
        addToCart,
        clearCart,
        totalItemsInCart: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};