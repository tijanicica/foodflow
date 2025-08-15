import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom';
import { getFilteredRestaurants, getAllergens, getDietTypes } from '@/services/api';
import { SlidersHorizontal, UtensilsCrossed, X as XIcon, Search, Star as StarIcon } from 'lucide-react'; 
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

//================================================================================
// POMOĆNE KOMPONENTE (kompletne)
//================================================================================

const RestaurantCard = ({ restaurant, filters }) => {
    const createQueryString = (params) => {
        const searchParams = new URLSearchParams();
        if (params.dietTypeIds?.length) { params.dietTypeIds.forEach(id => searchParams.append('dietTypeIds', id)); }
        if (params.excludeAllergenIds?.length) { params.excludeAllergenIds.forEach(id => searchParams.append('excludeAllergenIds', id)); }
        return searchParams.toString();
    };
    const searchParamsString = createQueryString(filters);
    const imageUrl = restaurant.imageUrl || "https://via.placeholder.com/400x200?text=FoodFlow";
    return (
        <Link to={`/restaurant/${restaurant.id}?${searchParamsString}`} className="block group">
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5">
                <div className="overflow-hidden">
                    <img src={imageUrl} alt={restaurant.name} className="w-full h-48 object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-110" />
                </div>
                <div className="p-5">
                    <h3 className="text-xl font-bold text-brand-primary group-hover:text-brand-accent transition-colors truncate">{restaurant.name}</h3>
                    <div className="flex items-center mt-3 text-gray-700">
                        <StarIcon size={18} className="text-yellow-400 fill-yellow-400"/>
                        <span className="ml-1.5 font-bold">{restaurant.averageRating}</span>
                        <span className="mx-2.5 text-gray-300">•</span>
                        <span className="font-semibold text-gray-600">{restaurant.priceRange}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const FilterModal = ({ isOpen, onClose, onApply, initialFilters }) => {
    const [availableDietTypes, setAvailableDietTypes] = useState([]);
    const [availableAllergens, setAvailableAllergens] = useState([]);
    const [selectedDietTypeIds, setSelectedDietTypeIds] = useState(initialFilters.dietTypeIds);
    const [selectedExcludeAllergenIds, setExcludeAllergenIds] = useState(initialFilters.excludeAllergenIds);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    setAvailableDietTypes(await getDietTypes());
                    setAvailableAllergens(await getAllergens());
                } catch (error) { console.error("Failed to fetch filter data:", error); }
            };
            fetchData();
        }
    }, [isOpen]);
    
    useEffect(() => {
        setSelectedDietTypeIds(initialFilters.dietTypeIds);
        setExcludeAllergenIds(initialFilters.excludeAllergenIds);
    }, [initialFilters, isOpen]);

    const handleToggle = (id, list, setList) => { setList(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]); };
    const handleApply = () => { onApply({ dietTypeIds: selectedDietTypeIds, excludeAllergenIds: selectedExcludeAllergenIds }); onClose(); };
    const handleClear = () => { setSelectedDietTypeIds([]); setExcludeAllergenIds([]); };

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-brand-primary">More Filters</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2 text-brand-primary/90">Dietary Options</h3>
                        {availableDietTypes.map(diet => (<div key={diet.id} className="flex items-center gap-2 mb-1"><input type="checkbox" id={`diet-${diet.id}`} checked={selectedDietTypeIds.includes(diet.id)} onChange={() => handleToggle(diet.id, selectedDietTypeIds, setSelectedDietTypeIds)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"/><Label htmlFor={`diet-${diet.id}`}>{diet.name}</Label></div>))}
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2 text-brand-primary/90">Exclude Allergens</h3>
                        {availableAllergens.map(allergen => (<div key={allergen.id} className="flex items-center gap-2 mb-1"><input type="checkbox" id={`allergen-${allergen.id}`} checked={selectedExcludeAllergenIds.includes(allergen.id)} onChange={() => handleToggle(allergen.id, selectedExcludeAllergenIds, setExcludeAllergenIds)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"/><Label htmlFor={`allergen-${allergen.id}`}>{allergen.name}</Label></div>))}
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="outline" onClick={handleClear}>Clear</Button>
                    <Button onClick={handleApply} className="bg-brand-primary hover:bg-brand-primary/90">Apply Filters</Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Badge = ({ children, onRemove }) => (
    <motion.div layout className="flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary text-sm font-semibold pl-3 pr-1.5 py-1 rounded-full">
        <span>{children}</span>
        <button onClick={onRemove} className="rounded-full hover:bg-black/10 p-0.5"><XIcon size={14} /></button>
    </motion.div>
);

const AppliedFilters = ({ filters, setFilters, dietTypeMap, allergenMap }) => {
    const handleRemoveFilter = (type, value) => { setFilters(prev => ({ ...prev, [type]: prev[type].filter(item => item !== value) })); };
    const handleClearAll = () => { setFilters(prev => ({ ...prev, dietTypeIds: [], excludeAllergenIds: [], priceRanges: [] })); };
    
    const activeFiltersExist = filters.dietTypeIds.length > 0 || filters.excludeAllergenIds.length > 0 || filters.priceRanges.length > 0;
    if (!activeFiltersExist) return null;

    return (
        <div className="border-b">
            <div className="container mx-auto px-4 md:px-6 py-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-600 mr-2">Active Filters:</span>
                <AnimatePresence>
                    {filters.dietTypeIds.map(id => ( <Badge key={`diet-${id}`} onRemove={() => handleRemoveFilter('dietTypeIds', id)}>{dietTypeMap[id] || id}</Badge> ))}
                    {filters.excludeAllergenIds.map(id => ( <Badge key={`allergen-${id}`} onRemove={() => handleRemoveFilter('excludeAllergenIds', id)}>No {allergenMap[id] || id}</Badge> ))}
                    {filters.priceRanges.map(price => ( <Badge key={`price-${price}`} onRemove={() => handleRemoveFilter('priceRanges', price)}>{price}</Badge> ))}
                </AnimatePresence>
                <Button variant="link" className="text-red-500 hover:text-red-600 text-sm p-1 ml-auto" onClick={handleClearAll}>Clear All</Button>
            </div>
        </div>
    );
};

const RestaurantCardSkeleton = () => ( <div className="bg-white rounded-2xl shadow-sm border overflow-hidden animate-pulse"><div className="w-full h-48 bg-gray-200"></div><div className="p-5 space-y-3"><div className="h-5 w-3/4 bg-gray-200 rounded"></div><div className="h-4 w-1/3 bg-gray-200 rounded"></div></div></div> );
const EmptyState = ({ onClear }) => ( <div className="col-span-full text-center py-16 px-6 bg-white rounded-xl border-2 border-dashed"><UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-4 text-xl font-semibold text-gray-800">No Restaurants Found</h3><p className="mt-1 text-gray-500">Try adjusting your search or filters.</p><Button className="mt-6 bg-brand-primary hover:bg-brand-primary/90" onClick={onClear}>Clear All Filters</Button></div> );

//================================================================================
// GLAVNA KOMPONENTA STRANICE
//================================================================================
export function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({ searchTerm: '', dietTypeIds: [], excludeAllergenIds: [], priceRanges: [] });
  const [dietTypeMap, setDietTypeMap] = useState({});
  const [allergenMap, setAllergenMap] = useState({});

  const fetchRestaurants = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      const data = await getFilteredRestaurants(currentFilters);
      setRestaurants(data);
    } catch (error) { console.log("Error fetching restaurants on frontend", error); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [dietTypes, allergens] = await Promise.all([ getDietTypes(), getAllergens() ]);
        setDietTypeMap(Object.fromEntries(dietTypes.map(d => [d.id, d.name])));
        setAllergenMap(Object.fromEntries(allergens.map(a => [a.id, a.name])));
      } catch (error) { console.error("Failed to load filter names", error); }
    };
    fetchFilterData();
    fetchRestaurants(filters);
  }, []);

  useEffect(() => {
    const timerId = setTimeout(() => { fetchRestaurants(filters); }, 300);
    return () => clearTimeout(timerId);
  }, [filters, fetchRestaurants]);
  
  const handleSearchChange = (e) => { setFilters(prev => ({ ...prev, searchTerm: e.target.value })); };
  const handleApplyModalFilters = (modalFilters) => { setFilters(prev => ({ ...prev, ...modalFilters })); };
  const handlePriceFilterToggle = (price) => { setFilters(prev => ({ ...prev, priceRanges: prev.priceRanges.includes(price) ? prev.priceRanges.filter(p => p !== price) : [...prev.priceRanges, price] })); };
  const handleClearAllFilters = () => { setFilters({ searchTerm: '', dietTypeIds: [], excludeAllergenIds: [], priceRanges: [] }); };

  return (
    <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
      <Navbar />

      {/* === KOMPAKTNA HERO SEKCIJA === */}
      <header className="relative bg-cover bg-center text-white" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/images/hero-background.avif')` }}>
        <div className="container mx-auto px-4 md:px-6 py-16 sm:py-20 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold drop-shadow-lg">
                    Find your next favorite meal
                </h1>
                <p className="text-md sm:text-lg text-gray-200 max-w-xl mx-auto drop-shadow-lg mt-4">
                    What are you craving today?
                </p>
            </motion.div>
            
            <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative mt-8 max-w-2xl mx-auto"
            >
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                <Input 
                    type="search" 
                    placeholder="Search for restaurants, cuisines..."
                    className="h-14 w-full rounded-full pl-14 pr-6 text-md sm:text-lg text-black shadow-lg focus:ring-4 focus:ring-brand-accent/50"
                    value={filters.searchTerm}
                    onChange={handleSearchChange}
                />
            </motion.div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 md:px-6 py-12 flex-grow">
        
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Price:</span>
                {['$', '$$', '$$$'].map(price => ( 
                    <Button key={price} variant="outline" size="icon" onClick={() => handlePriceFilterToggle(price)} 
                        className={`rounded-full h-10 w-10 border-gray-300 transition-colors ${
                            filters.priceRanges.includes(price) && '!bg-brand-primary !text-white !border-brand-primary'
                        }`}>
                        {price}
                    </Button> 
                ))}
            </div>
            <Button variant="outline" onClick={() => setFilterModalOpen(true)} className="rounded-full h-10 px-4 border-gray-300">
                <SlidersHorizontal size={16} className="mr-2"/> More Filters
            </Button>
        </div>

        <AppliedFilters filters={filters} setFilters={setFilters} dietTypeMap={dietTypeMap} allergenMap={allergenMap}/>
        
        <div className="border-t pt-8 mt-8">
            <h2 className="text-3xl font-bold mb-6 text-brand-primary">Restaurants For You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                <AnimatePresence>
                    {loading ? (
                        [...Array(8)].map((_, i) => <RestaurantCardSkeleton key={i} />)
                    ) : restaurants.length > 0 ? (
                        restaurants.map((restaurant, index) => (
                            <motion.div key={restaurant.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                                <RestaurantCard restaurant={restaurant} filters={filters} />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div className="col-span-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <EmptyState onClear={handleClearAllFilters} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </main>

      <AnimatePresence>
        {isFilterModalOpen && <FilterModal isOpen={isFilterModalOpen} onClose={() => setFilterModalOpen(false)} onApply={handleApplyModalFilters} initialFilters={filters} />}
      </AnimatePresence>
      <Footer />
    </div>
  );
}