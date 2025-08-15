import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { getActiveMenu } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Star, Clock, ShoppingCart, Check, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

//================================================================================
// POMOĆNE FUNKCIJE I KOMPONENTE (kompletne)
//================================================================================

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

const MenuItemCard = ({ item, restaurant }) => {
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart(item, quantity, restaurant);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };
    
    const available = isItemAvailable(item);
    const imageUrl = item.imageUrl || "https://via.placeholder.com/150";

    return (
        <motion.div 
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`bg-white rounded-xl shadow-sm border flex flex-col sm:flex-row items-stretch gap-5 p-4 transition-all duration-300 ${!available ? 'opacity-60' : 'hover:shadow-lg'}`}
        >
            <img src={imageUrl} alt={item.name} className="w-full sm:w-40 h-40 sm:h-auto rounded-lg object-cover flex-shrink-0" />
      
            <div className="flex flex-col flex-grow">
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-brand-primary">{item.name}</h3>
                        {item.popular && available && (
                            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ml-2">
                                <Star size={12} /><span>POPULAR</span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                        {item.dietTypes?.map(diet => ( <span key={diet} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">{diet}</span> ))}
                        {item.allergens?.map(allergen => ( <span key={allergen} className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Contains: {allergen}</span> ))}
                    </div>
                     {item.timeFrom && item.timeTo && (
                         <p className="text-xs text-blue-600 font-semibold mt-2 flex items-center gap-1">
                            <Clock size={14} /> Available from {item.timeFrom.slice(0, 5)} to {item.timeTo.slice(0, 5)}
                         </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-dashed">
                    <p className="text-2xl font-bold text-brand-primary mb-3 sm:mb-0">{item.price.toFixed(2)} <span className="text-lg font-normal text-gray-500">RSD</span></p>

                    {available ? (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={isAdded}>-</Button>
                            <span className="font-bold w-10 text-center text-xl">{quantity}</span>
                            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q + 1)} disabled={isAdded}>+</Button>
                            <Button className="h-10 px-4 w-32 bg-brand-primary hover:bg-brand-primary/90" onClick={handleAddToCart} disabled={isAdded}>
                                <AnimatePresence mode="wait">
                                    {isAdded ? (
                                        <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center"><Check className="mr-2"/>Added</motion.span>
                                    ) : (
                                        <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center"><ShoppingCart className="mr-2"/>Add</motion.span>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </div>
                    ) : (
                        <div className="text-sm font-semibold text-red-600">Currently Unavailable</div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const MenuPageSkeleton = () => (
    <div className="w-full min-h-screen bg-brand-background-light">
        <Navbar />
        <header className="h-64 bg-gray-300 animate-pulse flex items-end p-8">
            <div className="space-y-4">
                <div className="h-14 w-80 bg-gray-400 rounded-lg"></div>
                <div className="h-6 w-64 bg-gray-400 rounded"></div>
            </div>
        </header>
        <main className="container mx-auto px-4 md:px-6 py-10">
            <div className="h-12 w-full bg-gray-200 rounded-full mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                     <div key={i} className="bg-white p-4 rounded-xl shadow-sm border flex gap-5 animate-pulse">
                        <div className="w-40 h-auto rounded-lg bg-gray-200 flex-shrink-0"></div>
                        <div className="flex-grow space-y-3">
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="flex justify-between items-center mt-8 pt-4 border-t border-dashed">
                                <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
                                <div className="h-10 w-32 bg-gray-200 rounded-md"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
        <Footer />
    </div>
);

const EmptyState = ({ message }) => (
    <div className="text-center py-16 px-6 bg-white rounded-xl border-2 border-dashed h-full flex flex-col justify-center items-center">
        <Utensils className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-xl font-semibold text-gray-800">No Items Found</h3>
        <p className="mt-1 text-gray-500">{message}</p>
    </div>
);

//================================================================================
// GLAVNA KOMPONENTA STRANICE
//================================================================================
export function MenuPage() {
    const { restaurantId } = useParams();
    const [searchParams] = useSearchParams();
    const [menuData, setMenuData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);

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

    const sortedCategories = useMemo(() => {
        if (!menuData) return [];
        const order = ['MAIN_COURSE', 'SIDE_DISH', 'SALAD', 'DESSERT', 'DRINK'];
        const categories = Object.keys(groupedAndSortedItems);
        if(categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0]);
        }
        return categories.sort((a, b) => {
            const indexA = order.indexOf(a) === -1 ? order.length : order.indexOf(a);
            const indexB = order.indexOf(b) === -1 ? order.length : order.indexOf(b);
            return indexA - indexB;
        });
    }, [groupedAndSortedItems, menuData, activeCategory]);

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
                if (data?.items.length > 0 && !activeCategory) {
                    const firstCategory = data.items[0].type || 'MAIN_COURSE';
                    setActiveCategory(firstCategory);
                }
            } catch (err) {
                console.error("Failed to fetch menu:", err);
                setError("Could not load menu. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [restaurantId, searchParams, activeCategory]);
    
    if (loading) return <MenuPageSkeleton />;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

    return (
        <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
            <Navbar />
            <div className="flex-grow">
                <header 
                    className="h-64 bg-gray-400 bg-center bg-cover flex items-end" 
                    style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.7)), url(${menuData.restaurantImageUrl})`}}
                >
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                        className="container mx-auto px-4 md:px-6 py-8 text-white"
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg">{menuData.restaurantName}</h1>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-lg">
                            <p className="flex items-center gap-1.5"><Star className="text-yellow-300" size={22}/> <span className="font-bold">{menuData.restaurantRating}</span></p>
                            <p className="flex items-center gap-1.5"><Clock size={18}/> {menuData.openingTime.slice(0,5)} - {menuData.closingTime.slice(0,5)}</p>
                        </div>
                    </motion.div>
                </header>
          
                <main className="container mx-auto px-4 md:px-6 py-10">
                    <nav className="sticky top-16 z-30 bg-brand-background-light/90 backdrop-blur-md -mx-4 px-4 border-b">
                        <div className="container mx-auto flex items-center gap-2 sm:gap-4 overflow-x-auto">
                            {sortedCategories.map(category => (
                                <button 
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`py-3 px-3 sm:px-4 font-semibold capitalize whitespace-nowrap transition-all duration-300 relative ${
                                        activeCategory === category ? 'text-brand-primary' : 'text-gray-500 hover:text-brand-primary'
                                    }`}
                                >
                                    {category.replace(/_/g, ' ').toLowerCase()}
                                    {activeCategory === category && (
                                        <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" layoutId="underline" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </nav>
                    
                    <div className="mt-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                            >
                                {(groupedAndSortedItems[activeCategory] || []).length > 0 ? (
                                    groupedAndSortedItems[activeCategory].map((item) => (
                                        <MenuItemCard 
                                            key={item.id}
                                            item={item} 
                                            restaurant={{ id: restaurantId, address: menuData.address, name: menuData.restaurantName, openingTime: menuData.openingTime, closingTime: menuData.closingTime }}
                                        />
                                    ))
                                ) : (
                                    <div className="lg:col-span-2">
                                        <EmptyState message="There are no items available in this category." />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}