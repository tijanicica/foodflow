// src/pages/HomePage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from 'react-router-dom'; 
import { getFilteredRestaurants, getAllergens, getDietTypes } from '@/services/api';

// --- POMOĆNA KOMPONENTA: Navbar ---
const Navbar = () => {
  const navigate = useNavigate(); // Inicijalizuj hook za navigaciju

  // Kreiraj logout funkciju
  const handleLogout = () => {
    // 1. Obriši token iz Local Storage
    localStorage.removeItem('jwtToken');
    
    // 2. Preusmeri korisnika na login stranicu
    // replace: true sprečava korisnika da se vrati na prethodnu stranicu klikom na "back"
    navigate('/login', { replace: true }); 
  };

  return (
    <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      {/* Logo sada takođe poziva logout */}
      <Link 
        to="/login" 
        onClick={handleLogout} 
        className="text-3xl font-bold text-brand-primary italic mr-auto"
      >
        foodFlow
      </Link>
      
      <nav className="hidden lg:flex gap-6 items-center text-lg font-medium text-brand-primary/80">
        <Link to="/home" className="font-bold text-brand-primary underline underline-offset-4">Home</Link>
        <Link to="/orders">My Orders</Link>
        <Link to="/analytics">My Analytics</Link>
        <Link to="/profile">My Profile</Link>
      </nav>

      <div className="flex items-center gap-4 ml-6">
        <Button variant="ghost" size="icon" className="rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span className="sr-only">Toggle cart</span>
        </Button>
        
        {/* Logout link je sada dugme koje poziva handleLogout */}
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

// --- POMOĆNA KOMPONENTA: RestaurantCard ---
const RestaurantCard = ({ restaurant }) => (
  <div className="bg-white rounded-xl shadow-md border border-brand-accent/20 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
    <img src={restaurant.imageUrl || "https://via.placeholder.com/400x200.png?text=Food+Flow"} alt={restaurant.name} className="w-full h-48 object-cover" />
    <div className="p-4">
      <h3 className="text-xl font-bold text-brand-primary">{restaurant.name}</h3>
      <div className="flex items-center mt-2 text-brand-primary/80">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="gold" stroke="gold" strokeWidth="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <span className="ml-1 font-semibold">{restaurant.averageRating}</span>
        <span className="mx-2">•</span>
        <span>{restaurant.priceRange}</span>
      </div>
    </div>
  </div>
);

// --- POMOĆNA KOMPONENTA: FilterModal ---
const FilterModal = ({ isOpen, onClose, onApply, initialFilters }) => {
  const [availableDietTypes, setAvailableDietTypes] = useState([]);
  const [availableAllergens, setAvailableAllergens] = useState([]);
  
  const [selectedDietTypeIds, setSelectedDietTypeIds] = useState(initialFilters.dietTypeIds);
  const [selectedExcludeAllergenIds, setExcludeAllergenIds] = useState(initialFilters.excludeAllergenIds);
  const [selectedPriceRanges, setPriceRanges] = useState(initialFilters.priceRanges);

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
  const handleTogglePrice = (price) => { setPriceRanges(prev => prev.includes(price) ? prev.filter(p => p !== price) : [...prev, price]); };

  const handleApply = () => {
    onApply({ dietTypeIds: selectedDietTypeIds, excludeAllergenIds: selectedExcludeAllergenIds, priceRanges: selectedPriceRanges });
    onClose();
  };
  
  const handleClear = () => {
    setSelectedDietTypeIds([]);
    setExcludeAllergenIds([]);
    setPriceRanges([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-brand-primary">Filters</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-brand-primary/90">Dietary</h3>
            {availableDietTypes.map(diet => (
              <div key={diet.id} className="flex items-center gap-2 mb-1">
                <input type="checkbox" id={`diet-${diet.id}`} checked={selectedDietTypeIds.includes(diet.id)} onChange={() => handleToggle(diet.id, selectedDietTypeIds, setSelectedDietTypeIds)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"/>
                <Label htmlFor={`diet-${diet.id}`}>{diet.name}</Label>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-brand-primary/90">Exclude Allergens</h3>
            {availableAllergens.map(allergen => (
              <div key={allergen.id} className="flex items-center gap-2 mb-1">
                <input type="checkbox" id={`allergen-${allergen.id}`} checked={selectedExcludeAllergenIds.includes(allergen.id)} onChange={() => handleToggle(allergen.id, selectedExcludeAllergenIds, setExcludeAllergenIds)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"/>
                <Label htmlFor={`allergen-${allergen.id}`}>{allergen.name}</Label>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-brand-primary/90">Price Range</h3>
            <div className="flex gap-2">
              {['$', '$$', '$$$'].map(price => (
                <Button key={price} variant={selectedPriceRanges.includes(price) ? 'default' : 'outline'} onClick={() => handleTogglePrice(price)} className={selectedPriceRanges.includes(price) ? 'bg-brand-primary' : ''}>{price}</Button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={handleClear}>Clear Filters</Button>
          <Button onClick={handleApply} className="bg-brand-primary">Apply Filters</Button>
        </div>
      </div>
    </div>
  );
};

// --- POMOĆNA KOMPONENTA: AppliedFilters ---
const AppliedFilters = ({ filters, setFilters, dietTypeMap, allergenMap }) => {
  const handleRemoveFilter = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: prev[type].filter(item => item !== value) }));
  };
  const handleClearAll = () => {
    setFilters(prev => ({ ...prev, dietTypeIds: [], excludeAllergenIds: [], priceRanges: [] }));
  };
  
  const activeFiltersExist = filters.dietTypeIds.length > 0 || filters.excludeAllergenIds.length > 0 || filters.priceRanges.length > 0;
  if (!activeFiltersExist) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 max-w-2xl mx-auto mt-4">
      {filters.dietTypeIds.map(id => ( <Badge key={`diet-${id}`} onRemove={() => handleRemoveFilter('dietTypeIds', id)}>{dietTypeMap[id] || id}</Badge> ))}
      {filters.excludeAllergenIds.map(id => ( <Badge key={`allergen-${id}`} onRemove={() => handleRemoveFilter('excludeAllergenIds', id)}>No {allergenMap[id] || id}</Badge> ))}
      {filters.priceRanges.map(price => ( <Badge key={`price-${price}`} onRemove={() => handleRemoveFilter('priceRanges', price)}>{price}</Badge> ))}
      <Button variant="link" className="text-brand-primary/80 text-sm p-1" onClick={handleClearAll}>Clear All</Button>
    </div>
  );
};

const Badge = ({ children, onRemove }) => (
  <div className="flex items-center gap-1 bg-gray-200 text-gray-700 text-sm font-medium pl-3 pr-2 py-1 rounded-full">
    <span>{children}</span>
    <button onClick={onRemove} className="text-gray-500 hover:text-gray-800">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  </div>
);

// --- GLAVNA KOMPONENTA: HomePage ---
export function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({ searchTerm: '', dietTypeIds: [], excludeAllergenIds: [], priceRanges: [] });
  const [dietTypeMap, setDietTypeMap] = useState({});
  const [allergenMap, setAllergenMap] = useState({});

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const dietTypes = await getDietTypes();
        const allergens = await getAllergens();
        setDietTypeMap(Object.fromEntries(dietTypes.map(d => [d.id, d.name])));
        setAllergenMap(Object.fromEntries(allergens.map(a => [a.id, a.name])));
      } catch (error) { console.error("Failed to load filter names", error); }
    };
    fetchFilterData();
  }, []);

  const fetchRestaurants = useCallback(async (currentFilters) => {
    try {
      const data = await getFilteredRestaurants(currentFilters);
      setRestaurants(data);
    } catch (error) { console.log("Error fetching restaurants on frontend", error); }
  }, []);

  useEffect(() => {
    const timerId = setTimeout(() => { fetchRestaurants(filters); }, 300);
    return () => clearTimeout(timerId);
  }, [filters, fetchRestaurants]);
  
  const handleSearchChange = (e) => { setFilters(prev => ({ ...prev, searchTerm: e.target.value })); };
  const handleApplyFilters = (appliedFiltersFromModal) => { setFilters(prev => ({ ...prev, ...appliedFiltersFromModal })); };

  return (
    <div className="w-full min-h-screen bg-brand-background-light">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-primary">What are you craving today?</h1>
        </div>
        <div className="flex items-center max-w-2xl mx-auto mt-8">
          <Input 
            type="search" 
            placeholder="Search for a restaurant or dish..."
            className="h-12 text-lg flex-grow rounded-l-full px-6 bg-white shadow-sm"
            value={filters.searchTerm}
            onChange={handleSearchChange}
          />
          <Button className="h-12 rounded-r-full px-6 text-lg bg-brand-primary" onClick={() => setFilterModalOpen(true)}>
            Filters
          </Button>
        </div>

        <AppliedFilters filters={filters} setFilters={setFilters} dietTypeMap={dietTypeMap} allergenMap={allergenMap}/>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {restaurants.length > 0 ? (
            restaurants.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))
          ) : (
            <p className="col-span-full text-center text-brand-primary/80 mt-8">No restaurants match your criteria.</p>
          )}
        </div>
      </main>
      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setFilterModalOpen(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </div>
  );
}