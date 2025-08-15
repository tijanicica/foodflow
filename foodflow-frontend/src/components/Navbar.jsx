import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useCart } from '@/context/CartContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ShoppingCart, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';

// 1. Definišemo linkove za GLAVNU navigaciju
const mainNavLinks = [
    { href: "/home", label: "Home", activePaths: ["/home", "/restaurant"] },
    { href: "/orders", label: "My Orders", activePaths: ["/orders", "/order/", "/track/"] },
    { href: "/analytics", label: "My Analytics", activePaths: ["/analytics"] },
];

/**
 * Pomoćna komponenta za jedan navigacioni link.
 */
const NavItem = ({ href, label, activePaths, onClick }) => {
    const location = useLocation();
    const isActive = activePaths.some(path => location.pathname.startsWith(path));

    return (
        <NavLink to={href} onClick={onClick} className={`px-2 py-1 transition-colors duration-200 ${
            isActive ? "text-brand-primary font-semibold border-b-2 border-brand-primary" : "text-brand-primary/70 hover:text-brand-primary"
        }`}>
            {label}
        </NavLink>
    );
};

export const Navbar = () => {
    const navigate = useNavigate();
    const { totalItemsInCart } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userName, setUserName] = useState('');

    // Hook za detekciju skrola i dodavanje senke
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hook za čitanje imena korisnika iz JWT tokena
    useEffect(() => {
        try {
            const token = localStorage.getItem('jwtToken');
            if (token) {
                const decodedToken = jwtDecode(token);
                setUserName(decodedToken.name || decodedToken.fullName || 'Account');
            }
        } catch (error) {
            console.error("Invalid token:", error);
            setUserName('Account');
        }
    }, []);

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
        <>
            <header className={`flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 backdrop-blur-sm sticky top-0 z-50 transition-shadow duration-300 ${
                scrolled ? 'shadow-md border-b' : 'border-b border-transparent'
            }`}>
                <Link to="/home" className="text-3xl font-bold text-brand-primary italic">
                    foodFlow
                </Link>
              
                {/* === DESKTOP NAVIGACIJA (Home, My Orders, My Analytics) === */}
                <nav className="hidden lg:flex items-center gap-6 text-lg font-medium">
                    {mainNavLinks.map((link) => (
                        <NavItem key={link.href} {...link} />
                    ))}
                </nav>
        
                <div className="flex items-center gap-2">
                    <NavLink 
                        to="/checkout" 
                        onClick={handleCartClick}
                        className={({ isActive }) => `relative ${isActive && "ring-2 ring-brand-primary rounded-full"}`}
                    >
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ShoppingCart className="h-6 w-6 text-brand-primary/80" />
                            {totalItemsInCart > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {totalItemsInCart}
                                </span>
                            )}
                        </Button>
                    </NavLink>
                    
                    {/* === KORISNIČKI DROPDOWN MENI (My Profile, Logout) === */}
                    <div className="hidden lg:block">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="rounded-full flex items-center gap-2 px-3 h-10">
                                    <UserIcon className="h-5 w-5 text-brand-primary/70" />
                                    <span className="font-semibold text-brand-primary">{userName}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 mt-2">
                                <DropdownMenuItem onClick={() => navigate('/profile')}>
                                    <UserIcon className="mr-2 h-4 w-4" /> My Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                                    <LogOut className="mr-2 h-4 w-4" /> Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Hamburger ikonica - vidljiva samo na manjim ekranima */}
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMenuOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>
            </header>

            {/* === MOBILNI MENI (OVERLAY) === */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 lg:hidden"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <motion.nav
                            initial={{ x: "100%" }} animate={{ x: "0%" }} exit={{ x: "100%" }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="fixed top-0 right-0 h-full bg-white w-4/5 max-w-sm p-6 shadow-lg" 
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-2xl font-bold text-brand-primary italic">Menu</span>
                                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}><X className="h-6 w-6" /></Button>
                            </div>
                            <div className="flex flex-col items-start gap-5 text-xl">
                                {mainNavLinks.map((link) => (
                                    <NavItem key={link.href} {...link} onClick={() => setIsMenuOpen(false)} />
                                ))}
                                {/* "My Profile" je odvojen u mobilnom meniju radi važnosti */}
                                <NavItem href="/profile" label="My Profile" activePaths={["/profile"]} onClick={() => setIsMenuOpen(false)} />
                                
                                <div className="w-full h-px bg-gray-200 my-4"></div>

                                <button onClick={handleLogout} className="flex items-center gap-3 text-red-600 hover:text-red-800 font-semibold">
                                    <LogOut size={22} /><span>Logout</span>
                                </button>
                            </div>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};