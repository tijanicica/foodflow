import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom';
import { getFilteredRestaurants, getAllergens, getDietTypes } from '@/services/api';
import { SlidersHorizontal, UtensilsCrossed, X as XIcon, Search } from 'lucide-react'; 
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';

// --- KARTICA RESTORANA (BEZ IZMENA U LOGICI) ---
const RestaurantCard = ({ restaurant, filters }) => {
  const createQueryString = (params) => {
    const searchParams = new URLSearchParams();
    if (params.dietTypeIds?.length) { params.dietTypeIds.forEach(id => searchParams.append('dietTypeIds', id)); }
    if (params.excludeAllergenIds?.length) { params.excludeAllergenIds.forEach(id => searchParams.append('excludeAllergenIds', id)); }
    return searchParams.toString();
  };
  const searchParamsString = createQueryString(filters);
  const imageUrl = restaurant.imageUrl || "https://via.placeholder.com/400x200.png?text=Food+Flow";
    
  return (
    <Link to={`/restaurant/${restaurant.id}?${searchParamsString}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <img src={imageUrl} alt={restaurant.name} className="w-full h-48 object-cover" />
        <div className="p-4">
          <h3 className="text-xl font-bold text-brand-primary group-hover:text-brand-accent transition-colors">{restaurant.name}</h3>
          <div className="flex items-center mt-2 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#facc15" stroke="#fca5a5" strokeWidth="0.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span className="ml-1 font-semibold">{restaurant.averageRating}</span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="font-semibold">{restaurant.priceRange}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// --- MODAL (BEZ IZMENA U LOGICI) ---
const FilterModal = ({ isOpen, onClose, onApply, initialFilters }) => {
  // ... sva logika modala ostaje nepromenjena
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

  const handleToggle = (id, list, setList) => { setList(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]); };
  const handleApply = () => { onApply({ dietTypeIds: selectedDietTypeIds, excludeAllergenIds: selectedExcludeAllergenIds }); onClose(); };
  const handleClear = () => { setSelectedDietTypeIds([]); setExcludeAllergenIds([]); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-brand-primary">More Filters</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-brand-primary/90">Dietary</h3>
            {availableDietTypes.map(diet => (<div key={diet.id} className="flex items-center gap-2 mb-1"><input type="checkbox" id={`diet-${diet.id}`} checked={selectedDietTypeIds.includes(diet.id)} onChange={() => handleToggle(diet.id, selectedDietTypeIds, setSelectedDietTypeIds)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"/><Label htmlFor={`diet-${diet.id}`}>{diet.name}</Label></div>))}
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-brand-primary/90">Exclude Allergens</h3>
            {availableAllergens.map(allergen => (<div key={allergen.id} className="flex items-center gap-2 mb-1"><input type="checkbox" id={`allergen-${allergen.id}`} checked={selectedExcludeAllergenIds.includes(allergen.id)} onChange={() => handleToggle(allergen.id, selectedExcludeAllergenIds, setExcludeAllergenIds)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"/><Label htmlFor={`allergen-${allergen.id}`}>{allergen.name}</Label></div>))}
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={handleClear}>Clear</Button>
          <Button onClick={handleApply} className="bg-brand-primary">Apply Filters</Button>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONENTA ZA PRIKAZ AKTIVNIH FILTERA ---
const Badge = ({ children, onRemove }) => (
  <div className="flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary text-sm font-semibold pl-3 pr-1.5 py-1 rounded-full">
    <span>{children}</span>
    <button onClick={onRemove} className="rounded-full hover:bg-black/10 p-0.5"><XIcon size={14} /></button>
  </div>
);

const AppliedFilters = ({ filters, setFilters, dietTypeMap, allergenMap }) => {
    const handleRemoveFilter = (type, value) => { setFilters(prev => ({ ...prev, [type]: prev[type].filter(item => item !== value) })); };
    const handleClearAll = () => { setFilters(prev => ({ ...prev, dietTypeIds: [], excludeAllergenIds: [], priceRanges: [] })); };
    
    const activeFiltersExist = filters.dietTypeIds.length > 0 || filters.excludeAllergenIds.length > 0 || filters.priceRanges.length > 0;
    if (!activeFiltersExist) return null;

    return (
        <div className="container mx-auto px-4 md:px-6 py-4 bg-brand-background-light">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-600 mr-2">Active Filters:</span>
                {filters.dietTypeIds.map(id => ( <Badge key={`diet-${id}`} onRemove={() => handleRemoveFilter('dietTypeIds', id)}>{dietTypeMap[id] || id}</Badge> ))}
                {filters.excludeAllergenIds.map(id => ( <Badge key={`allergen-${id}`} onRemove={() => handleRemoveFilter('excludeAllergenIds', id)}>No {allergenMap[id] || id}</Badge> ))}
                {filters.priceRanges.map(price => ( <Badge key={`price-${price}`} onRemove={() => handleRemoveFilter('priceRanges', price)}>{price}</Badge> ))}
                <Button variant="link" className="text-red-500 hover:text-red-600 text-sm p-1" onClick={handleClearAll}>Clear All</Button>
            </div>
        </div>
    );
};

// --- SKELETON I EMPTY STATE KOMPONENTE ---
const RestaurantCardSkeleton = () => ( <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse"><div className="w-full h-48 bg-gray-200"></div><div className="p-4 space-y-3"><div className="h-5 w-3/4 bg-gray-200 rounded"></div><div className="h-4 w-1/3 bg-gray-200 rounded"></div></div></div> );
const EmptyState = ({ onClear }) => ( <div className="col-span-full text-center py-16 px-6 bg-white rounded-xl border border-dashed"><UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-xl font-semibold text-gray-800">No Restaurants Found</h3><p className="mt-1 text-gray-500">Try adjusting your search or filters.</p><Button className="mt-6 bg-brand-primary" onClick={onClear}>Clear All Filters</Button></div> );

// --- GLAVNA REDIZAJNIRANA KOMPONENTA ---
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
    fetchRestaurants(filters); // Inicijalno učitavanje restorana
  }, [fetchRestaurants]);

  useEffect(() => {
    const timerId = setTimeout(() => { fetchRestaurants(filters); }, 500);
    return () => clearTimeout(timerId);
  }, [filters, fetchRestaurants]);
  
  const handleSearchChange = (e) => { setFilters(prev => ({ ...prev, searchTerm: e.target.value })); };
  const handleApplyModalFilters = (modalFilters) => { setFilters(prev => ({ ...prev, ...modalFilters })); };
  const handlePriceFilterToggle = (price) => { setFilters(prev => ({ ...prev, priceRanges: prev.priceRanges.includes(price) ? prev.priceRanges.filter(p => p !== price) : [...prev.priceRanges, price] })); };
  const handleClearAllFilters = () => { setFilters({ searchTerm: filters.searchTerm, dietTypeIds: [], excludeAllergenIds: [], priceRanges: [] }); };

  return (
    <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
      <Navbar />

      <header className="relative bg-cover bg-center text-white" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('/images/hero-background.avif')` }}>
        <div className="container mx-auto px-4 md:px-6 py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Find your next meal</h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">Discover the best food from restaurants near you.</p>

            {/* Redizajnirani panel bez blura */}
            <div className="mt-8 p-4 bg-black/30 rounded-xl max-w-3xl mx-auto">
                <div className="relative flex items-center w-full">
                    <Search className="absolute left-4 text-gray-400" />
                    <Input 
                        type="search" 
                        placeholder="Search for a restaurant or dish..."
                        className="h-14 text-lg w-full rounded-full pl-12 pr-4 text-black shadow-lg focus:ring-2 focus:ring-brand-primary"
                        value={filters.searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                    {['$', '$$', '$$$'].map(price => ( <Button key={price} variant={filters.priceRanges.includes(price) ? 'default' : 'secondary'} onClick={() => handlePriceFilterToggle(price)} className={`rounded-full transition-colors ${filters.priceRanges.includes(price) ? 'bg-brand-primary text-white' : 'bg-white/90 text-gray-800 hover:bg-white'}`}>{price}</Button> ))}
                    <Button variant="secondary" onClick={() => setFilterModalOpen(true)} className="rounded-full bg-white/90 text-gray-800 hover:bg-white"><SlidersHorizontal className="mr-2 h-4 w-4" /> More Filters</Button>
                </div>
            </div>
        </div>
      </header>
      
      {/* Prikaz aktivnih filtera */}
      <AppliedFilters filters={filters} setFilters={setFilters} dietTypeMap={dietTypeMap} allergenMap={allergenMap}/>
      
      <main className="container mx-auto px-4 md:px-6 py-12 flex-grow">
        <h2 className="text-3xl font-bold mb-6 text-brand-primary">Restaurants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            [...Array(8)].map((_, i) => <RestaurantCardSkeleton key={i} />)
          ) : restaurants.length > 0 ? (
            restaurants.map((restaurant, index) => (
              <motion.div key={restaurant.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <RestaurantCard restaurant={restaurant} filters={filters} />
              </motion.div>
            ))
          ) : (
            <EmptyState onClear={handleClearAllFilters} />
          )}
        </div>
      </main>

      <FilterModal isOpen={isFilterModalOpen} onClose={() => setFilterModalOpen(false)} onApply={handleApplyModalFilters} initialFilters={filters}/>
      
      <Footer />
    </div>
  );
}