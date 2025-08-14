import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { getActiveMenu } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// --- HELPER FUNCTION FOR AVAILABILITY CHECK ---
const isItemAvailable = (item) => {
    const isTimeLimited = item.timeFrom && item.timeTo;
    if (!isTimeLimited) {
        return item.available;
    }
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const isAvailableByTime = currentTime >= item.timeFrom && currentTime <= item.timeTo;
    
    return item.available && isAvailableByTime;
};

// --- MENU ITEM CARD COMPONENT (IMPROVED) ---
const MenuItemCard = ({ item, restaurant }) => {
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart(item, quantity, restaurant);
        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
        }, 2000); // Revert button state after 2 seconds
    };
    
    const available = isItemAvailable(item);
    const imageUrl = item.imageUrl || "https://via.placeholder.com/150";

    return (
        <div 
            className={`
                bg-white p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row items-start sm:items-center gap-4
                transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-[1.01]
                ${!available ? 'opacity-50' : ''} 
                ${item.popular && available ? 'border-yellow-400 border-2' : ''}
            `}
        >
          <img src={imageUrl} alt={item.name} className="w-full sm:w-28 h-40 sm:h-28 rounded-md object-cover" />
      
            <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-brand-primary">{item.name}</h3>
                    {item.popular && (
                        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            <Star size={12} />
                            <span>POPULAR</span>
                        </div>
                    )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                    {item.dietTypes?.map(diet => (
                        <span key={diet} className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">{diet}</span>
                    ))}
                    {item.allergens?.map(allergen => (
                        <span key={allergen} className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Contains: {allergen}</span>
                    ))}
                </div>
                
                {item.timeFrom && item.timeTo && (
                     <p className="text-xs text-blue-600 font-semibold mt-2 flex items-center gap-1">
                        <Clock size={14} />
                        Available from {item.timeFrom.slice(0, 5)} to {item.timeTo.slice(0, 5)}
                     </p>
                )}
                
                <p className="text-lg font-bold text-brand-primary mt-3">{item.price.toFixed(2)} RSD</p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center ml-auto">
                {available ? (
                    <>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={isAdded}>-</Button>
                        <span className="font-bold w-8 text-center text-lg">{quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => q + 1)} disabled={isAdded}>+</Button>
                        <Button 
                            className={`h-10 px-6 transition-colors ${isAdded ? 'bg-green-500 hover:bg-green-600' : 'bg-brand-primary'}`} 
                            onClick={handleAddToCart}
                            disabled={isAdded}
                        >
                            {isAdded ? '✓ Added' : 'Add'}
                        </Button>
                    </>
                ) : (
                    <div className="text-sm font-semibold text-red-500 bg-red-100 px-3 py-1 rounded-md">
                        Currently Unavailable
                    </div>
                )}
            </div>
        </div>
    );
};

// --- SKELETON COMPONENT FOR LOADING EFFECT ---
const MenuPageSkeleton = () => (
    <div className="w-full min-h-screen bg-brand-background-light">
        <Navbar />
        <header className="h-56 bg-gray-300 animate-pulse flex items-end p-8">
            <div className="space-y-3">
                <div className="h-12 w-80 bg-gray-400 rounded"></div>
                <div className="h-6 w-24 bg-gray-400 rounded"></div>
            </div>
        </header>
        <main className="container mx-auto px-4 md:px-6 py-8">
            <div className="h-12 w-full bg-gray-200 rounded-md mb-8"></div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                     <div key={i} className="bg-white p-4 rounded-lg shadow-sm border flex gap-4 animate-pulse">
                        <div className="w-28 h-28 rounded-md bg-gray-200"></div>
                        <div className="flex-grow space-y-3">
                            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/4 mt-2"></div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    </div>
);

// --- MAIN PAGE COMPONENT (IMPROVED) ---
export function MenuPage() {
    const { restaurantId } = useParams();
    const [searchParams] = useSearchParams();
    const [menuData, setMenuData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('MAIN_COURSE');

    const groupedAndSortedItems = useMemo(() => {
        if (!menuData) return {};
        const grouped = menuData.items.reduce((acc, item) => {
            const type = item.type || 'MAIN_COURSE';
            if (!acc[type]) acc[type] = [];
            acc[type].push(item);
            return acc;
        }, {});
        for (const category in grouped) {
            grouped[category].sort((a, b) => {
                const aIsAvailable = isItemAvailable(a);
                const bIsAvailable = isItemAvailable(b);
                if (aIsAvailable !== bIsAvailable) return aIsAvailable ? -1 : 1;
                if (a.popular !== b.popular) return a.popular ? -1 : 1;
                return 0;
            });
        }
        return grouped;
    }, [menuData]);

    const categories = Object.keys(groupedAndSortedItems);
    const sortedCategories = useMemo(() => {
        const order = ['MAIN_COURSE', 'DESSERT', 'DRINK'];
        return categories.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    }, [categories]);

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

    const headerImageUrl = menuData?.restaurantImageUrl || '';
    
    if (loading) return <MenuPageSkeleton />;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

    return (
        <div className="w-full min-h-screen bg-brand-background-light">
            <Navbar />
            <header 
                className="h-56 bg-gray-400 bg-center bg-cover flex items-end p-8" 
                style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${headerImageUrl})`}}
            >
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{menuData.restaurantName}</h1>
                    <div className="flex items-center gap-4 mt-2 text-lg">
                        <p className="text-yellow-300 flex items-center gap-1.5">
                            <Star size={20} /> 
                            {menuData.restaurantRating}
                        </p>
                        {menuData.openingTime && menuData.closingTime && (
                            <p className="text-white flex items-center gap-1.5">
                                <Clock size={18} /> 
                                {menuData.openingTime.slice(0,5)} - {menuData.closingTime.slice(0,5)}
                            </p>
                        )}
                    </div>
                </div>
            </header>
      
            <main className="container mx-auto px-4 md:px-6 py-8">
                {/* STICKY CATEGORY NAVIGATION */}
                <nav className="sticky top-0 z-10 bg-brand-background-light/90 backdrop-blur-md flex justify-center gap-4 sm:gap-8 mb-8 border-b">
                    {sortedCategories.map(category => (
                        <button 
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`py-3 px-2 sm:px-4 font-semibold capitalize transition-colors duration-200 ${activeCategory === category ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500 hover:text-brand-primary'}`}
                        >
                            {category.replace('_', ' ').toLowerCase()}s
                        </button>
                    ))}
                </nav>
                
                {/* GRID LAYOUT FOR MENU ITEMS */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {groupedAndSortedItems[activeCategory]?.length > 0 ? (
                        groupedAndSortedItems[activeCategory].map((item, index) => (
                            // ANIMATION FOR EACH ITEM
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <MenuItemCard 
                                    item={item} 
                                    restaurant={{ id: restaurantId, address: menuData.address, name: menuData.restaurantName, openingTime: menuData.openingTime, closingTime: menuData.closingTime }}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 mt-8 xl:col-span-2">No items match your criteria in this category.</p>
                    )}
                </div>
            </main>
        </div>
    );
}