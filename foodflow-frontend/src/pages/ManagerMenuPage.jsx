import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar';
import { Button } from '@/components/ui/button';
import { getManagerMenus, createManagerMenu, deactivateMenu, activateMenu, updateMenuName } from '@/services/api';
import toast from 'react-hot-toast';
import { CreateMenuModal } from '@/components/modals/CreateMenuModal';
import { EditMenuModal } from '@/components/modals/EditMenuModal';

const MenuRow = ({ menu, onDeactivate, onActivate, onEdit }) => {
    const navigate = useNavigate();
    const handleRowClick = () => navigate(`/manager/menu/${menu.id}`);
    const creationDate = menu.creationDate ? new Date(menu.creationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

    return (
        <div onClick={handleRowClick} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-4">
                <p className="text-lg font-semibold text-brand-primary">{menu.name}</p>
                {menu.active ? (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">ACTIVE</span>
                ) : (
                    <span className="text-sm text-gray-500">Created: {creationDate}</span>
                )}
            </div>
            <div onClick={e => e.stopPropagation()} className="flex items-center gap-4 text-sm font-medium">
                <button onClick={() => onEdit(menu)} className="text-brand-primary hover:underline">Edit</button>
                {menu.active && (
                    <button onClick={() => onDeactivate(menu.id)} className="text-red-600 hover:underline">Delete</button>
                )}
                {!menu.active && (
                    <Button onClick={() => onActivate(menu.id)} variant="outline" size="sm">Activate</Button>
                )}
            </div>
        </div>
    );
};

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
        } catch (error) {
            toast.error("Failed to load menus.");
        } finally {
            setLoading(false); // Ovo osigurava da se "Loading" skloni čak i ako dođe do greške
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    const handleOpenCreateModal = (restaurantId) => {
        setRestaurantForModal(restaurantId);
        setCreateModalOpen(true);
    };

    const handleCreateMenu = async (menuData) => {
        const toastId = toast.loading('Creating menu...');
        try {
            const payload = { ...menuData, restaurantId: restaurantForModal };
            await createManagerMenu(payload);
            toast.success('Menu created successfully!', { id: toastId });
            setCreateModalOpen(false);
            setRestaurantForModal(null);
            fetchMenus();
        } catch (error) {
            toast.error('Failed to create menu.', { id: toastId });
        }
    };
    
    const handleDeactivate = async (id) => {
        if (window.confirm("Are you sure you want to deactivate this menu?")) {
            const toastId = toast.loading('Deactivating menu...');
            try {
                await deactivateMenu(id);
                toast.success('Menu deactivated.', { id: toastId });
                fetchMenus();
            } catch (error) {
                const errorMessage = error.response?.status === 400 ? "Cannot deactivate the only active menu." : "Failed to deactivate menu.";
                toast.error(errorMessage, { id: toastId });
            }
        }
    };

    const handleActivate = async (id) => {
        const toastId = toast.loading('Activating menu...');
        try {
            await activateMenu(id);
            toast.success('Menu activated.', { id: toastId });
            fetchMenus();
        } catch (error) {
            toast.error('Failed to activate menu.', { id: toastId });
        }
    };
    
    const handleEdit = (menu) => {
        setSelectedMenu(menu);
        setEditModalOpen(true);
    };

    const handleUpdateMenu = async (menuData) => {
        const toastId = toast.loading('Updating menu...');
        try {
            await updateMenuName(selectedMenu.id, menuData);
            toast.success('Menu updated!', { id: toastId });
            setEditModalOpen(false);
            setSelectedMenu(null);
            fetchMenus();
        } catch (error) {
            toast.error('Failed to update menu.', { id: toastId });
        }
    };
    
    return (
        <div className="w-full min-h-screen bg-brand-background-light">
            <ManagerNavbar />
            <main className="container mx-auto max-w-5xl px-4 md:px-6 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-brand-primary">Menu Management</h1>
                </div>
                <div className="space-y-8">
                    {loading ? (
                        <p>Loading menus...</p>
                    ) : restaurantData && restaurantData.length > 0 ? (
                        restaurantData.map(data => (
                            <div key={data.restaurantId} className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h2 className="text-2xl font-bold text-gray-800">{data.restaurantName}</h2>
                                    <Button onClick={() => handleOpenCreateModal(data.restaurantId)}>+ Create New Menu</Button>
                                </div>
                                {data.menus && data.menus.length > 0 ? (
                                    data.menus.map(menu => (
                                        <MenuRow key={menu.id} menu={menu} onDeactivate={handleDeactivate} onActivate={handleActivate} onEdit={handleEdit} />
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-4">This restaurant has no menus.</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">You are not managing any restaurants.</p>
                    )}
                </div>
            </main>
            
            <CreateMenuModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateMenu} />
            {selectedMenu && ( <EditMenuModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} onSubmit={handleUpdateMenu} menu={selectedMenu} /> )}
        </div>
    );
}