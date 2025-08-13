// src/components/Navbar.jsx

import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export const Navbar = () => {
    const navigate = useNavigate();
    const { totalItemsInCart } = useCart();
    const location = useLocation(); // Dohvatamo trenutnu lokaciju

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        navigate('/login', { replace: true });
    };

    const handleCartClick = (event) => {
        if (totalItemsInCart === 0) {
            event.preventDefault();
            toast.error("Your cart is empty!");
        }
    };

    return (
        <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <Link to="/home" className="text-3xl font-bold text-brand-primary italic mr-auto">
                foodFlow
            </Link>
          
            <nav className="hidden lg:flex gap-6 items-center text-lg font-medium text-brand-primary/80">
                <Link 
                    to="/home" 
                    className={
                        location.pathname === '/home' || location.pathname.startsWith('/restaurant/') 
                        ? "text-brand-primary border-b-2 border-brand-primary" 
                        : "hover:text-brand-primary"
                    }
                >
                    Home
                </Link>

                {/* === ISPRAVKA ZA MY ORDERS (DODAT I /track-order/) === */}
                <Link 
                    to="/orders" 
                    className={
                        location.pathname.startsWith('/orders') || 
                        location.pathname.startsWith('/order/') ||
                        location.pathname.startsWith('/track/')
                        ? "text-brand-primary border-b-2 border-brand-primary" 
                        : "hover:text-brand-primary"
                    }
                >
                    My Orders
                </Link>

                <Link 
                    to="/analytics" 
                    className={
                        location.pathname.startsWith('/analytics') 
                        ? "text-brand-primary border-b-2 border-brand-primary" 
                        : "hover:text-brand-primary"
                    }
                >
                    My Analytics
                </Link>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        isActive ? "text-brand-primary border-b-2 border-brand-primary" : "hover:text-brand-primary"
                    }
                >
                    My Profile
                </NavLink>
            </nav>
    
            <div className="flex items-center gap-4 ml-6">
                <NavLink to="/checkout" onClick={handleCartClick} 
                    className={({ isActive }) => isActive ? 'ring-2 ring-brand-primary rounded-full' : ''}>
                    <Button variant="ghost" size="icon" className="rounded-full relative">
                        <ShoppingCart className="h-6 w-6 text-brand-primary/80" />
                        
                        {totalItemsInCart > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {totalItemsInCart}
                            </span>
                        )}
                    </Button>
                </NavLink>
                
                <button 
                    onClick={handleLogout} 
                    className="hidden lg:inline-block text-lg font-medium text-brand-primary/80 hover:text-brand-primary"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};