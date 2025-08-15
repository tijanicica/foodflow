import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom';
import { getFilteredRestaurants, getAllergens, getDietTypes } from '@/services/api';
import { SlidersHorizontal, UtensilsCrossed, X as XIcon, Search, Star as StarIcon, ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react'; 
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";

//================================================================================
// POMOĆNE KOMPONENTE (kompletne)
//================================================================================

const RestaurantCard = ({ restaurant }) => {
    const imageUrl = restaurant.imageUrl || "https://via.placeholder.com/400x200?text=FoodFlow";
    return (
        <Link to={`/restaurant/${restaurant.id}`} className="block group">
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

const FeaturedCard = ({ restaurant }) => (
    <Link to={`/restaurant/${restaurant.id}`} className="block group w-64 md:w-72 flex-shrink-0">
        <div className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl">
            <img 
                src={restaurant.imageUrl || 'https://via.placeholder.com/300x400?text=FoodFlow'} 
                alt={restaurant.name} 
                className="w-full h-80 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 text-white">
                <h4 className="font-bold text-xl drop-shadow-md truncate">{restaurant.name}</h4>
                <div className="flex items-center text-sm mt-1">
                    <StarIcon size={16} className="text-yellow-300 fill-yellow-300"/>
                    <span className="ml-1 font-semibold">{restaurant.averageRating}</span>
                    <span className="mx-2 opacity-70">•</span>
                    <span className="opacity-90">{restaurant.priceRange}</span>
                </div>
            </div>
        </div>
    </Link>
);

const FilterOption = ({ label, isSelected, onSelect }) => (
    <button
        onClick={onSelect}
        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
            isSelected ? 'bg-brand-background-light' : 'bg-white hover:bg-gray-50'
        }`}
    >
        <span className={`font-semibold ${isSelected ? 'text-brand-primary' : 'text-gray-700'}`}>
            {label}
        </span>
        {isSelected ? <CheckCircle className="text-brand-primary" /> : <Circle className="text-gray-300" />}
    </button>
);

const FilterModal = ({ isOpen, onClose, onApply, initialFilters }) => {
    const [availableDietTypes, setAvailableDietTypes] = useState([]);
    const [availableAllergens, setAvailableAllergens] = useState([]);
    const [selectedDietTypeIds, setSelectedDietTypeIds] = useState(initialFilters.dietTypeIds || []);
    const [selectedExcludeAllergenIds, setExcludeAllergenIds] = useState(initialFilters.excludeAllergenIds || []);

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
        if (isOpen) {
            setSelectedDietTypeIds(initialFilters.dietTypeIds || []);
            setExcludeAllergenIds(initialFilters.excludeAllergenIds || []);
        }
    }, [initialFilters, isOpen]);

    const handleToggle = (id, list, setList) => { setList(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]); };
    const handleApply = () => { onApply({ dietTypeIds: selectedDietTypeIds, excludeAllergenIds: selectedExcludeAllergenIds }); onClose(); };
    const handleClear = () => { setSelectedDietTypeIds([]); setExcludeAllergenIds([]); };
    const totalFilters = selectedDietTypeIds.length + selectedExcludeAllergenIds.length;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl shadow-lg w-full max-w-sm flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <DialogHeader className="p-6 border-b text-left">
                            <h2 className="text-2xl font-bold text-brand-primary">Filters</h2>
                        </DialogHeader>
                        <div className="p-4 h-96 overflow-y-auto space-y-6">
                            <section>
                                <h3 className="font-bold text-lg text-gray-800 mb-2 px-2">Dietary Options</h3>
                                <div className="space-y-1">
                                    {availableDietTypes.length > 0 ? availableDietTypes.map(diet => (
                                        <FilterOption key={diet.id} label={diet.name} isSelected={selectedDietTypeIds.includes(diet.id)} onSelect={() => handleToggle(diet.id, selectedDietTypeIds, setSelectedDietTypeIds)}/>
                                    )) : <p className="text-sm text-gray-500 px-2">No dietary options available.</p>}
                                </div>
                            </section>
                            <section>
                                <h3 className="font-bold text-lg text-gray-800 mb-2 px-2">Exclude Allergens</h3>
                                <div className="space-y-1">
                                     {availableAllergens.length > 0 ? availableAllergens.map(allergen => (
                                        <FilterOption key={allergen.id} label={allergen.name} isSelected={selectedExcludeAllergenIds.includes(allergen.id)} onSelect={() => handleToggle(allergen.id, selectedExcludeAllergenIds, setExcludeAllergenIds)}/>
                                    )) : <p className="text-sm text-gray-500 px-2">No allergens to exclude.</p>}
                                </div>
                            </section>
                        </div>
                        <DialogFooter className="p-4 bg-gray-50/70 border-t flex justify-between items-center">
                            <Button variant="link" onClick={handleClear} className="text-gray-600 hover:text-brand-primary">Clear All</Button>
                            <Button onClick={handleApply} className="bg-brand-primary hover:bg-brand-primary/90 w-40">
                                Apply Filters {totalFilters > 0 && `(${totalFilters})`}
                            </Button>
                        </DialogFooter>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
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

const FeaturedSection = ({ title, restaurants }) => {
    const scrollRef = useRef(null);
    const scroll = (direction) => {
        const { current } = scrollRef;
        if (current) {
            const scrollAmount = direction === 'left' ? -current.offsetWidth * 0.75 : current.offsetWidth * 0.75;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };
    if (!restaurants || restaurants.length === 0) return null;
    return (
        <section className="relative group/section">
            <h2 className="text-3xl font-bold text-brand-primary mb-4">{title}</h2>
            <div className="absolute top-1/2 -translate-y-1/2 -left-5 opacity-0 group-hover/section:opacity-100 transition-opacity z-10 hidden sm:block">
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 bg-white/80 shadow-md" onClick={() => scroll('left')}><ChevronLeft /></Button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-5 opacity-0 group-hover/section:opacity-100 transition-opacity z-10 hidden sm:block">
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 bg-white/80 shadow-md" onClick={() => scroll('right')}><ChevronRight /></Button>
            </div>
            <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
                {restaurants.map(r => <FeaturedCard key={`${title}-${r.id}`} restaurant={r}/>)}
            </div>
        </section>
    );
};

//================================================================================
// GLAVNA KOMPONENTA STRANICE
//================================================================================
export function HomePage() {
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({ searchTerm: '', dietTypeIds: [], excludeAllergenIds: [], priceRanges: [] });
  const [dietTypeMap, setDietTypeMap] = useState({});
  const [allergenMap, setAllergenMap] = useState({});

  const fetchFilteredRestaurants = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      const data = await getFilteredRestaurants(currentFilters);
      setFilteredRestaurants(data);
    } catch (error) { console.log("Error fetching restaurants", error); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [allData, diets, allergens] = await Promise.all([
          getFilteredRestaurants({}),
          getDietTypes(),
          getAllergens()
        ]);
        setAllRestaurants(allData);
        setFilteredRestaurants(allData);
        setDietTypeMap(Object.fromEntries(diets.map(d => [d.id, d.name])));
        setAllergenMap(Object.fromEntries(allergens.map(a => [a.id, a.name])));
      } catch (error) { console.error("Failed to load initial data", error); }
      finally { setLoading(false); }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchFilteredRestaurants(filters);
    }, 300);
    return () => clearTimeout(timerId);
  }, [filters, fetchFilteredRestaurants]);
  
  const highestRated = useMemo(() => 
    [...allRestaurants].sort((a, b) => b.averageRating - a.averageRating).slice(0, 10),
    [allRestaurants]
  );
  
  const handleSearchChange = (e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  const handleApplyModalFilters = (modalFilters) => setFilters(prev => ({ ...prev, ...modalFilters }));
  const handlePriceFilterToggle = (price) => setFilters(prev => ({ ...prev, priceRanges: prev.priceRanges.includes(price) ? prev.priceRanges.filter(p => p !== price) : [...prev.priceRanges, price] }));
  const handleClearAllFilters = () => setFilters({ searchTerm: '', dietTypeIds: [], excludeAllergenIds: [], priceRanges: [] });

  return (
    <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
      <Navbar />

      <header className="relative bg-cover bg-center text-white" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url('/images/hero-background.avif')` }}>
        <div className="container mx-auto px-4 md:px-6 py-20 sm:py-24 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg">Food, fast & fresh.</h1>
                <p className="text-lg text-gray-200 max-w-2xl mx-auto drop-shadow-lg mt-4">Order from the best local spots with just a few clicks.</p>
            </motion.div>
            <motion.div 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
                className="relative mt-8 max-w-2xl mx-auto"
            >
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                <Input type="search" placeholder="Search for restaurants or cuisines..."
                    className="h-16 w-full rounded-full pl-16 pr-6 text-lg text-black shadow-2xl focus:ring-4 focus:ring-brand-accent/50"
                    value={filters.searchTerm} onChange={handleSearchChange} />
            </motion.div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 md:px-6 py-12 flex-grow">
        
        {!loading && allRestaurants.length > 0 && (
            <div className="mb-16">
                <FeaturedSection title="Trending Now" restaurants={highestRated} />
            </div>
        )}

        <div className="border-t pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <h2 className="text-3xl font-bold text-brand-primary">All Restaurants</h2>
                <div className="flex items-center gap-2">
                    {['$', '$$', '$$$'].map(price => ( 
                        <Button key={price} variant="outline" size="icon" onClick={() => handlePriceFilterToggle(price)} 
                            className={`rounded-full h-10 w-10 border-gray-300 transition-colors ${filters.priceRanges.includes(price) && '!bg-brand-primary !text-white !border-brand-primary'}`}>
                            {price}
                        </Button> 
                    ))}
                    <Button variant="outline" onClick={() => setFilterModalOpen(true)} className="rounded-full h-10 px-4 border-gray-300">
                        <SlidersHorizontal size={16} className="mr-2"/> More
                    </Button>
                </div>
            </div>
            <AppliedFilters filters={filters} setFilters={setFilters} dietTypeMap={dietTypeMap} allergenMap={allergenMap}/>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 mt-8">
                <AnimatePresence>
                    {loading ? (
                        [...Array(8)].map((_, i) => <RestaurantCardSkeleton key={i} />)
                    ) : filteredRestaurants.length > 0 ? (
                        filteredRestaurants.map((restaurant) => (
                            <motion.div key={restaurant.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                                <RestaurantCard restaurant={restaurant} />
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