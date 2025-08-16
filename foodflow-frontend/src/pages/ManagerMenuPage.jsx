// src/pages/ManagerMenuPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar';
import { getManagerMenus, createManagerMenu, deactivateMenu, activateMenu, updateMenuName } from '@/services/api';
import toast from 'react-hot-toast';
import { CreateMenuModal } from '@/components/modals/CreateMenuModal';
import { EditMenuModal } from '@/components/modals/EditMenuModal';
import { PlusCircle, Pencil, Power, PowerOff, CheckCircle, Clock, Utensils, BookOpen, ChevronRight } from 'lucide-react';

// === Potpuno redizajniran red za prikaz menija ===
const MenuRow = ({ menu, onDeactivate, onActivate, onEdit }) => {
    const navigate = useNavigate();
    const handleRowClick = () => navigate(`/manager/menu/${menu.id}`);
    const creationDate = menu.creationDate ? new Date(menu.creationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

    return (
        <div 
            onClick={handleRowClick} 
            className="group flex items-center justify-between p-4 bg-white/50 hover:bg-white/80 cursor-pointer transition-all duration-300 rounded-lg transform hover:scale-[1.02]"
        >
            <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-2 rounded-lg">
                    <BookOpen size={20} className="text-pink-600" />
                </div>
                <div>
                    <p className="text-lg font-semibold text-gray-800">{menu.name}</p>
                    {menu.active ? (
                        <div className="flex items-center text-sm font-medium text-green-600 mt-1">
                            <span className="relative flex h-2 w-2 mr-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                            Aktivan
                        </div>
                    ) : (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock size={14} className="mr-1.5" /><span>Kreiran: {creationDate}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); onEdit(menu); }} className="text-gray-400 hover:text-purple-600 p-2 rounded-full hover:bg-purple-100 transition-colors" title="Izmeni naziv"><Pencil size={18} /></button>
                {menu.active ? 
                    (<button onClick={(e) => { e.stopPropagation(); onDeactivate(menu.id); }} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors" title="Deaktiviraj"><PowerOff size={18} /></button>) : 
                    (<button onClick={(e) => { e.stopPropagation(); onActivate(menu.id); }} className="text-gray-400 hover:text-green-600 p-2 rounded-full hover:bg-green-100 transition-colors" title="Aktiviraj"><Power size={18} /></button>)
                }
                <ChevronRight size={20} className="text-gray-300 group-hover:text-pink-500 transition-colors" />
            </div>
        </div>
    );
};

// === GLAVNA KOMPONENTA STRANICE ===
export function ManagerMenuPage() {
    // State-ovi ostaju isti
    const [restaurantData, setRestaurantData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [restaurantForModal, setRestaurantForModal] = useState(null);

    // Handler funkcije ostaju iste
    const fetchMenus = async () => { if (!loading) setLoading(true); try { const data = await getManagerMenus(); setRestaurantData(data); } catch (error) { toast.error("Neuspešno učitavanje menija."); } finally { setLoading(false); } };
    useEffect(() => { fetchMenus(); }, []);
    const handleOpenCreateModal = (restaurantId) => { setRestaurantForModal(restaurantId); setCreateModalOpen(true); };
    const handleCreateMenu = async (menuData) => { await toast.promise(createManagerMenu({ ...menuData, restaurantId: restaurantForModal }), { loading: 'Kreiranje menija...', success: 'Meni uspešno kreiran!', error: 'Greška pri kreiranju menija.' }); setCreateModalOpen(false); setRestaurantForModal(null); fetchMenus(); };
    const handleDeactivate = async (id) => { if (window.confirm("Da li ste sigurni da želite da deaktivirate ovaj meni?")) { await toast.promise(deactivateMenu(id), { loading: 'Deaktiviranje...', success: 'Meni deaktiviran.', error: (err) => err.response?.status === 400 ? "Ne možete deaktivirati jedini aktivan meni." : "Greška pri deaktivaciji." }); fetchMenus(); } };
    const handleActivate = async (id) => { await toast.promise(activateMenu(id), { loading: 'Aktiviranje...', success: 'Meni aktiviran!', error: 'Greška pri aktivaciji.' }); fetchMenus(); };
    const handleEdit = (menu) => { setSelectedMenu(menu); setEditModalOpen(true); };
    const handleUpdateMenu = async (menuData) => { await toast.promise(updateMenuName(selectedMenu.id, menuData), { loading: 'Ažuriranje menija...', success: 'Meni ažuriran!', error: 'Greška pri ažuriranju.' }); setEditModalOpen(false); setSelectedMenu(null); fetchMenus(); };

    const LoadingSpinner = () => (<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div></div>);
    const EmptyState = ({ message, subMessage }) => (<div className="text-center py-20 bg-white/30 rounded-xl"><Utensils size={48} className="mx-auto text-gray-400" /><p className="mt-4 text-gray-600 font-semibold">{message}</p><p className="text-sm text-gray-500">{subMessage}</p></div>);
    
    return (
        <div className="w-full min-h-screen bg-pink-50/50">
            <ManagerNavbar />
            <main className="container mx-auto max-w-6xl px-4 md:px-6 py-12">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Menu Management</h1>
                        <p className="text-gray-500 mt-1">Upravljate menijima za <span className="font-bold text-pink-600">{restaurantData.length}</span> restorana.</p>
                    </div>
                </div>
                <div className="space-y-12">
                    {loading ? <LoadingSpinner /> : restaurantData && restaurantData.length > 0 ? (
                        restaurantData.map(data => (
                            <div key={data.restaurantId} className="bg-white/50 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/50">
                                <div className="flex justify-between items-center mb-5 border-b border-gray-200/50 pb-5">
                                    <div className="flex items-center gap-3">
                                        <Utensils size={24} className="text-pink-600"/>
                                        <h2 className="text-2xl font-bold text-gray-800">{data.restaurantName}</h2>
                                    </div>
                                    <button onClick={() => handleOpenCreateModal(data.restaurantId)} className="flex items-center gap-2 bg-pink-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-700 transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transform hover:-translate-y-0.5">
                                        <PlusCircle size={18} />Kreiraj Meni
                                    </button>
                                </div>
                                {data.menus && data.menus.length > 0 ? 
                                    (<div className="space-y-3">{data.menus.map(menu => (<MenuRow key={menu.id} menu={menu} onDeactivate={handleDeactivate} onActivate={handleActivate} onEdit={handleEdit} />))}</div>) : 
                                    (<div className="text-center text-gray-500 py-10">Ovaj restoran trenutno nema kreiranih menija.</div>)
                                }
                            </div>
                        ))
                    ) : (<EmptyState message="Nema restorana" subMessage="Trenutno ne upravljate nijednim restoranom." />)}
                </div>
            </main>
            
            <CreateMenuModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateMenu} />
            {selectedMenu && ( <EditMenuModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} onSubmit={handleUpdateMenu} menu={selectedMenu} /> )}
        </div>
    );
}