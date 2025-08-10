import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useCart } from '@/context/CartContext'; // Importuj hook da pristupiš korpi
import { ShoppingCart } from 'lucide-react';    // Importuj ikonicu za korpu

export const Navbar = () => {
    const navigate = useNavigate();
    const { totalItemsInCart } = useCart(); // Uzmi ukupan broj stavki iz konteksta

    // Kompletna funkcija za logout
    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        navigate('/login', { replace: true }); 
    };

    return (
        <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            {/* Logo koji na klik takođe odjavljuje korisnika */}
            <Link 
                to="/login" 
                onClick={handleLogout} 
                className="text-3xl font-bold text-brand-primary italic mr-auto"
            >
                foodFlow
            </Link>
          
            {/* Glavna navigacija */}
            <nav className="hidden lg:flex gap-6 items-center text-lg font-medium text-brand-primary/80">
                <Link to="/home" className="hover:text-brand-primary">Home</Link>
                <Link to="/orders" className="hover:text-brand-primary">My Orders</Link>
                <Link to="/analytics" className="hover:text-brand-primary">My Analytics</Link>
                <Link to="/profile" className="hover:text-brand-primary">My Profile</Link>
            </nav>
    
            {/* Desni deo sa korpom i logout dugmetom */}
            <div className="flex items-center gap-4 ml-6">
                {/* Link ka checkout stranici koji obmotava ikonicu korpe */}
                <Link to="/checkout"> 
                    <Button variant="ghost" size="icon" className="rounded-full relative">
                        <ShoppingCart className="h-6 w-6 text-brand-primary/80" />
                        
                        {/* Crveni bedž sa brojem, prikazuje se samo ako ima stavki u korpi */}
                        {totalItemsInCart > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {totalItemsInCart}
                            </span>
                        )}
                    </Button>
                </Link>
                
                {/* Logout dugme */}
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