import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { getActiveMenu } from '@/services/api';
import { useCart } from '@/context/CartContext'; // 1. Uvezemo hook koji nam daje pristup korpi
import { Navbar } from '@/components/Navbar'; // Prilagodi putanju ako je potrebno




const MenuItemCard = ({ item, restaurant }) => { // Prima i informaciju o restoranu kao 'prop'
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart(); // 2. Izvadimo funkciju 'addToCart' iz konteksta

    const handleAddToCart = () => {
        // 3. Pozovemo 'addToCart' sa svim potrebnim podacima
        addToCart(item, quantity, restaurant);
    };
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img src={item.imageUrl || "https://via.placeholder.com/100"} alt={item.name} className="w-full sm:w-24 h-40 sm:h-24 rounded-md object-cover" />
      
            <div className="flex-grow">
                <h3 className="text-lg font-bold text-brand-primary">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                    {item.dietTypes?.map(diet => (
                        <span key={diet} className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            {diet}
                        </span>
                    ))}
                    {item.allergens?.map(allergen => (
                        <span key={allergen} className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                            Contains: {allergen}
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
      
            <header 
                className="h-56 bg-gray-400 bg-center bg-cover flex items-end p-8" 
                style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${menuData.restaurantImageUrl})`}}
            >
                <div>
                    <h1 className="text-5xl font-bold text-white">{menuData.restaurantName}</h1>
                    <p className="text-xl text-yellow-300 mt-2">★ {menuData.restaurantRating}</p>
                </div>
            </header>
      
            <main className="container mx-auto px-4 md:px-6 py-8">
                <div className="space-y-4">
                    {menuData.items.length > 0 ? (
                        menuData.items.map(item => (
                            // 4. Prosledimo informaciju o restoranu u svaku karticu
                            <MenuItemCard 
                                key={item.id} 
                                item={item} 
                                restaurant={{ id: restaurantId, address: menuData.address ,name: menuData.restaurantName, openingTime: menuData.openingTime,
                    closingTime: menuData.closingTime }}
                            />
                        ))
                    ) : (
                        <p className="text-center text-brand-primary/80 mt-8">No menu items match your selected filters for this restaurant.</p>
                    )}
                </div>
            </main>
        </div>
    );
}