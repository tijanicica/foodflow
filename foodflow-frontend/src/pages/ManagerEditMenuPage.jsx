import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar';
import { getMenuVersionDetails, addMenuItem, getAllergens, getDietTypes, updateMenuItem, deleteMenuItem } from '@/services/api';
import toast from 'react-hot-toast';
import { AddMenuItemModal } from '@/components/modals/AddMenuItemModal';
import { EditMenuItemModal } from '@/components/modals/EditMenuItemModal';
import { PlusCircle, Pencil, Trash2, ArrowLeft, UtensilsCrossed } from 'lucide-react';

// === KARTICA ZA STAVKU MENIJA (ostaje ista) ===
const MenuItemCard = ({ item, onEdit, onDelete }) => (
    <div className="group relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={() => onEdit(item)} className="bg-white/80 backdrop-blur-sm text-purple-600 p-2 rounded-full shadow-md hover:bg-white" title="Izmeni stavku">
                <Pencil size={18} />
            </button>
            <button onClick={() => onDelete(item.id)} className="bg-white/80 backdrop-blur-sm text-red-600 p-2 rounded-full shadow-md hover:bg-white" title="Obriši stavku">
                <Trash2 size={18} />
            </button>
        </div>
        <div className="w-full">
            <img 
                src={item.imageUrl || "/images/placeholder.jpg"} 
                alt={item.name}
                className="w-full h-auto aspect-[4/3] object-cover bg-gray-100"
            />
        </div>
        <div className="p-5">
            <h3 className="text-xl font-bold text-gray-800 truncate">{item.name}</h3>
            <p className="text-sm text-gray-500 mt-1 h-10 overflow-hidden">{item.description || 'Nema opisa.'}</p>
            <p className="text-2xl font-extrabold text-pink-600 mt-4 text-right">
                {item.price ? `${item.price.toFixed(2)} RSD` : 'N/A'}
            </p>
        </div>
    </div>
);

// === GLAVNA KOMPONENTA STRANICE ===
export function ManagerEditMenuPage() {
    const { menuVersionId } = useParams();
    const [menuDetails, setMenuDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [allergens, setAllergens] = useState([]);
    const [dietTypes, setDietTypes] = useState([]);

    const fetchDetails = async () => {
        try {
            const data = await getMenuVersionDetails(menuVersionId);
            setMenuDetails(data);
        } catch (error) {
            toast.error("Neuspešno učitavanje detalja menija.");
        } finally {
            if (loading) setLoading(false);
        }
    };
    
    useEffect(() => {
        setLoading(true);
        const loadInitialData = async () => {
            try {
                const [allergensData, dietTypesData] = await Promise.all([getAllergens(), getDietTypes()]);
                setAllergens(allergensData);
                setDietTypes(dietTypesData);
            } catch (error) {
                toast.error("Nije moguće učitati podatke za formu.");
            }
        };
        loadInitialData();
        fetchDetails();
    }, [menuVersionId]);


    // V V V  IZMENJENA FUNKCIJA ZA DODAVANJE  V V V
    const handleAddItem = async (itemData) => {
        const toastId = toast.loading('Dodavanje stavke...');
        try {
            await addMenuItem(menuVersionId, itemData);
            toast.success('Stavka uspešno dodata!', { id: toastId });
            setAddModalOpen(false);
            fetchDetails();
        } catch (error) {
            // Proveravamo da li greška ima specifičnu poruku sa servera
            const errorMessage = error.response?.data?.message || 'Greška pri dodavanju stavke.';
            toast.error(errorMessage, { id: toastId });
        }
    };
    // A A A  KRAJ IZMENE  A A A

    const handleEditClick = (item) => {
        setSelectedItem(item);
        setEditModalOpen(true);
    };

    // V V V  IZMENJENA FUNKCIJA ZA AŽURIRANJE  V V V
    const handleUpdateItem = async (id, itemData) => {
        const toastId = toast.loading('Ažuriranje stavke...');
        try {
            await updateMenuItem(id, itemData);
            toast.success('Stavka uspešno ažurirana!', { id: toastId });
            setEditModalOpen(false);
            fetchDetails();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Greška pri ažuriranju.';
            toast.error(errorMessage, { id: toastId });
        }
    };
    // A A A  KRAJ IZMENE  A A A


    const handleDeleteItem = async (id) => {
        if (window.confirm("Da li ste sigurni da želite da obrišete ovu stavku?")) {
            await toast.promise(deleteMenuItem(id), {
                loading: 'Brisanje stavke...',
                success: 'Stavka obrisana.',
                error: 'Greška pri brisanju.'
            });
            fetchDetails();
        }
    };
    
    const LoadingSpinner = () => (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
        </div>
    );
    
    const EmptyState = () => (
        <div className="col-span-full text-center py-20 bg-white rounded-xl shadow-lg">
            <UtensilsCrossed size={48} className="mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500">Ovaj meni još uvek nema nijednu stavku.</p>
            <p className="text-sm text-gray-400">Dodajte prvu klikom na dugme iznad!</p>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-pink-50/50">
            <ManagerNavbar />
            <main className="container mx-auto max-w-7xl px-4 md:px-6 py-12">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
                    <div>
                        <Link to="/manager/menu" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-pink-600 mb-2 transition-colors">
                            <ArrowLeft size={16} />
                            Nazad na sve menije
                        </Link>
                        <h1 className="text-4xl font-bold text-gray-800">{menuDetails?.menuName || 'Učitavanje...'}</h1>
                    </div>
                    <button 
                        onClick={() => setAddModalOpen(true)}
                        className="flex items-center gap-2 bg-pink-500 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        <PlusCircle size={20} />
                        Dodaj Stavku
                    </button>
                </div>
                
                {loading ? <LoadingSpinner /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {menuDetails && menuDetails.items.length > 0 ? (
                            menuDetails.items.map(item => <MenuItemCard key={item.id} item={item} onEdit={handleEditClick} onDelete={handleDeleteItem} />)
                        ) : (
                            <EmptyState />
                        )}
                    </div>
                )}
            </main>

            <AddMenuItemModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSubmit={handleAddItem}
                allergens={allergens}
                dietTypes={dietTypes}
            />
            {isEditModalOpen && (
                <EditMenuItemModal 
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onSubmit={handleUpdateItem}
                    item={selectedItem}
                    allergens={allergens}
                    dietTypes={dietTypes}
                />
            )}
        </div>
    );
}