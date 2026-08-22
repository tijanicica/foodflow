import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar';
import { getManagerMenus, createManagerMenu, deactivateMenu, activateMenu, updateMenuName } from '@/services/api';
import toast from 'react-hot-toast';
import { CreateMenuModal } from '@/components/modals/CreateMenuModal';
import { EditMenuModal } from '@/components/modals/EditMenuModal';
import { PlusCircle, Pencil, Power, PowerOff, Clock, Utensils, BookOpen, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

//================================================================================
// POMOĆNA KOMPONENTA: MenuRow (sa hover dugmićima)
//================================================================================
const MenuRow = ({ menu, onDeactivate, onActivate, onEdit }) => {
    const navigate = useNavigate();
    const handleRowClick = () => navigate(`/manager/menu/${menu.id}`);
    
    return (
        <div 
            onClick={handleRowClick} 
            className="group flex items-center justify-between p-3 hover:bg-pink-50/50 cursor-pointer transition-colors duration-200 rounded-lg"
        >
            <div className="flex items-center gap-4">
                <div className="bg-pink-100/70 p-2.5 rounded-lg">
                    <BookOpen size={20} className="text-pink-600" />
                </div>
                <div>
                    <p className="font-semibold text-gray-800">{menu.name}</p>
                    {menu.active && (
                        <div className="flex items-center text-sm font-medium text-green-600 mt-1">
                             <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                            Aktivan
                        </div>
                    )}
                </div>
            </div>
            {/* Akcije koje se pojavljuju na hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={(e) => { e.stopPropagation(); onEdit(menu); }} className="text-gray-400 hover:text-purple-600 p-2 rounded-full hover:bg-purple-100" title="Izmeni naziv"><Pencil size={16} /></button>
                {menu.active ? 
                    (<button onClick={(e) => { e.stopPropagation(); onDeactivate(menu.id); }} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100" title="Deaktiviraj"><PowerOff size={16} /></button>) : 
                    (<button onClick={(e) => { e.stopPropagation(); onActivate(menu.id); }} className="text-gray-400 hover:text-green-600 p-2 rounded-full hover:bg-green-100" title="Aktiviraj"><Power size={16} /></button>)
                }
                <ChevronRight size={20} className="text-gray-400" />
            </div>
        </div>
    );
};

const EmptyState = ({ message, subMessage }) => (<div className="text-center py-20 bg-white/30 rounded-xl"><Utensils size={48} className="mx-auto text-gray-400" /><p className="mt-4 text-gray-600 font-semibold">{message}</p><p className="text-sm text-gray-500">{subMessage}</p></div>);

//================================================================================
// GLAVNA KOMPONENTA STRANICE
//================================================================================
export function ManagerMenuPage() {
    const [restaurantData, setRestaurantData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [restaurantForModal, setRestaurantForModal] = useState(null);

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const data = await getManagerMenus();
            setRestaurantData(data);
        } catch (error) { toast.error("Neuspešno učitavanje menija."); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchMenus(); }, []);

    // Handler funkcije ostaju iste
    const handleOpenCreateModal = (restaurantId) => { setRestaurantForModal(restaurantId); setCreateModalOpen(true); };
    const handleCreateMenu = async (menuData) => { await toast.promise(createManagerMenu({ ...menuData, restaurantId: restaurantForModal }), { loading: 'Kreiranje menija...', success: 'Meni uspešno kreiran!', error: 'Greška pri kreiranju menija.' }); setCreateModalOpen(false); setRestaurantForModal(null); fetchMenus(); };
    const handleDeactivate = async (id) => { if (window.confirm("Da li ste sigurni da želite da deaktivirate ovaj meni?")) { await toast.promise(deactivateMenu(id), { loading: 'Deaktiviranje...', success: 'Meni deaktiviran.', error: (err) => err.response?.status === 400 ? "Ne možete deaktivirati jedini aktivan meni." : "Greška pri deaktivaciji." }); fetchMenus(); } };
    const handleActivate = async (id) => { await toast.promise(activateMenu(id), { loading: 'Aktiviranje...', success: 'Meni aktiviran!', error: 'Greška pri aktivaciji.' }); fetchMenus(); };
    const handleEdit = (menu) => { setSelectedMenu(menu); setEditModalOpen(true); };
    const handleUpdateMenu = async (menuData) => { await toast.promise(updateMenuName(selectedMenu.id, menuData), { loading: 'Ažuriranje menija...', success: 'Meni ažuriran!', error: 'Greška pri ažuriranju.' }); setEditModalOpen(false); setSelectedMenu(null); fetchMenus(); };

    return (
        // Vraćamo vašu roze pozadinu
        <div className="w-full min-h-screen bg-pink-50/40 flex flex-col">
            <ManagerNavbar />
            
            <header className="relative bg-cover bg-center text-white" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/images/manager-hero.avif')` }}>
                <div className="container mx-auto px-4 md:px-6 py-20 sm:py-24 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg">Menu Manager</h1>
                        <p className="text-lg text-gray-200 max-w-2xl mx-auto drop-shadow-lg mt-4">Upravljajte menijima za sve vaše restorane na jednom mestu.</p>
                    </motion.div>
                </div>
            </header>

            <main className="container mx-auto max-w-6xl px-4 md:px-6 py-12 flex-grow">
                <div className="space-y-8">
                    {loading ? (
                         <div className="text-center p-10"><p className="text-gray-500">Učitavanje podataka...</p></div>
                    ) : restaurantData && restaurantData.length > 0 ? (
                        restaurantData.map(data => {
                            // Ako proxy u vite.config.js radi, ovo je dovoljno.
                            // Ako ne, vratićemo na 'http://localhost:8080' + data.restaurantImageUrl
                            const fullImageUrl = data.restaurantImageUrl || `https://via.placeholder.com/400x250?text=${data.restaurantName.replace(' ', '+')}`;
                            
                            return (
                                <motion.section 
                                    key={data.restaurantId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100/50"
                                >
                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        
                                        <div className="w-full md:w-1/3 flex-shrink-0">
                                            <img src={fullImageUrl} alt={data.restaurantName} className="w-full h-48 object-cover rounded-xl shadow-md"/>
                                        </div>

                                        <div className="w-full md:w-2/3">
                                            <div className="flex justify-between items-center pb-4 border-b border-gray-200/80">
                                                <div className="flex items-center gap-4">
                                                    <Utensils size={24} className="text-pink-500"/>
                                                    <h2 className="text-2xl font-bold text-gray-800">{data.restaurantName}</h2>
                                                </div>
                                                <button onClick={() => handleOpenCreateModal(data.restaurantId)} className="flex items-center gap-2 bg-pink-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-700 transition-all duration-300 shadow-lg shadow-pink-500/30 transform hover:-translate-y-px">
                                                    <PlusCircle size={18} />Kreiraj Meni
                                                </button>
                                            </div>
                                        
                                            <div className="mt-4">
                                                {data.menus && data.menus.length > 0 ? 
                                                    (<div className="space-y-1">{data.menus.map(menu => (<MenuRow key={menu.id} menu={menu} onDeactivate={handleDeactivate} onActivate={handleActivate} onEdit={handleEdit} />))}</div>) : 
                                                    (<div className="text-center text-gray-500 py-10">Ovaj restoran trenutno nema kreiranih menija.</div>)
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            );
                        })
                    ) : (
                        <EmptyState message="Nema restorana" subMessage="Trenutno ne upravljate nijednim restoranom." />
                    )}
                </div>
            </main>
            
            <CreateMenuModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateMenu} />
            {selectedMenu && ( <EditMenuModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} onSubmit={handleUpdateMenu} menu={selectedMenu} /> )}
        </div>
    );
}