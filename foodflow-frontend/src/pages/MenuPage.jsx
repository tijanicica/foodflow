import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { getActiveMenu } from '@/services/api';

// Pomoćna komponenta za Navbar, ostaje ista
const Navbar = () => (
    <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <Link to="/home" className="text-3xl font-bold text-brand-primary italic mr-auto">
            foodFlow
        </Link>
        <nav className="hidden lg:flex gap-6 items-center text-lg font-medium text-brand-primary/80">
            <Link to="/home">Home</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/analytics">My Analytics</Link>
            <Link to="/profile">My Profile</Link>
        </nav>
        <div className="flex items-center gap-4 ml-6">
            <Button variant="ghost" size="icon" className="rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <span className="sr-only">Toggle cart</span>
            </Button>
            <Link to="/logout" className="hidden lg:inline-block text-lg font-medium text-brand-primary/80">Logout</Link>
        </div>
    </header>
);

// --- IZMENJENA KOMPONENTA: MenuItemCard ---
// Dodat je prikaz za alergene i tipove ishrane
const MenuItemCard = ({ item }) => {
    const [quantity, setQuantity] = useState(1);
  
    const handleAddToCart = () => {
        console.log(`Added ${quantity} of ${item.name} to cart.`);
        // Ovde ide logika za dodavanje u korpu
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img src={item.imageUrl || "https://via.placeholder.com/100"} alt={item.name} className="w-full sm:w-24 h-40 sm:h-24 rounded-md object-cover" />
      
            <div className="flex-grow">
                <h3 className="text-lg font-bold text-brand-primary">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                
                {/* NOVI DEO: Prikaz tagova za ishranu i alergene */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {item.dietTypes?.map(diet => (
                        <span key={diet} className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            {diet}
                        </span>
                    ))}
                    {item.allergens?.map(allergen => (
                        <span key={allergen} className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                            Sadrži: {allergen}
                        </span>
                    ))}
                </div>
                
                <p className="text-lg font-bold text-brand-primary mt-3">{item.price} RSD</p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center ml-auto">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                <span className="font-bold w-8 text-center text-lg">{quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => q + 1)}>+</Button>
                <Button className="bg-brand-primary h-10 px-6" onClick={handleAddToCart}>Add</Button>
            </div>
        </div>
    );
};


// Glavna komponenta stranice
export function MenuPage() {
    const { restaurantId } = useParams();
    const [searchParams] = useSearchParams();
    const [menuData, setMenuData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            const filters = {
                dietTypeIds: searchParams.getAll('dietTypeIds'),
                excludeAllergenIds: searchParams.getAll('excludeAllergenIds'),
            };

            try {
                setLoading(true);
                const data = await getActiveMenu(restaurantId, filters);
                setMenuData(data);
            } catch (err) {
                console.error("Failed to fetch menu:", err);
                setError("Could not load menu. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [restaurantId, searchParams]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading menu...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    return (
        <div className="w-full min-h-screen bg-brand-background-light">
            <Navbar />
      
            {/* Zaglavlje sa informacijama o restoranu */}
            <header 
                className="h-56 bg-gray-400 bg-center bg-cover flex items-end p-8" 
                style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${menuData.restaurantImageUrl})`}}
            >
                <div>
                    <h1 className="text-5xl font-bold text-white">{menuData.restaurantName}</h1>
                    {/* IZMENA: Uklonjen tekst "(200+ ratings)" */}
                    <p className="text-xl text-yellow-300 mt-2">★ {menuData.restaurantRating}</p>
                </div>
            </header>
      
            <main className="container mx-auto px-4 md:px-6 py-8">
                {/* IZMENA: Uklonjena navigacija za kategorije jela (Main Courses, Desserts, Drinks) */}
        
                {/* Lista jela */}
                <div className="space-y-4">
                    {menuData.items.length > 0 ? (
                        menuData.items.map(item => (
                            <MenuItemCard key={item.id} item={item} />
                        ))
                    ) : (
                        <p className="text-center text-brand-primary/80 mt-8">No menu items match your selected filters for this restaurant.</p>
                    )}
                </div>
            </main>
        </div>
    );
}