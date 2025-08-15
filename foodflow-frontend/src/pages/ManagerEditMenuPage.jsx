// src/pages/ManagerEditMenuPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar';
import { Button } from '@/components/ui/button';
import { getMenuVersionDetails, addMenuItem, getAllergens, getDietTypes } from '@/services/api';
import toast from 'react-hot-toast';
import { AddMenuItemModal } from '@/components/modals/AddMenuItemModal';

const MenuItemRow = ({ item }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
        <p className="text-lg font-semibold text-brand-primary">{item.name}</p>
        <div className="flex items-center gap-6">
            <p className="text-md text-gray-700">{item.price ? item.price.toFixed(2) : 'N/A'} RSD</p>
            <div className="flex items-center gap-4 text-sm font-medium">
                <button className="text-brand-primary hover:underline">Edit</button>
                <button className="text-red-600 hover:underline">Delete</button>
            </div>
        </div>
    </div>
);

export function ManagerEditMenuPage() {
    const { menuVersionId } = useParams();
    const [menuDetails, setMenuDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allergens, setAllergens] = useState([]);
    const [dietTypes, setDietTypes] = useState([]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const data = await getMenuVersionDetails(menuVersionId);
            setMenuDetails(data);
        } catch (error) {
            toast.error("Failed to load menu details.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [allergensData, dietTypesData] = await Promise.all([getAllergens(), getDietTypes()]);
                setAllergens(allergensData);
                setDietTypes(dietTypesData);
            } catch (error) {
                toast.error("Could not load form data.");
            }
        };
        loadInitialData();
        fetchDetails();
    }, [menuVersionId]);

    const handleAddItem = async (itemData) => {
        const toastId = toast.loading('Adding item...');
        try {
            await addMenuItem(menuVersionId, itemData);
            toast.success('Item added successfully!', { id: toastId });
            setIsModalOpen(false);
            fetchDetails(); // Osveži listu stavki
        } catch (error) {
            toast.error('Failed to add item.', { id: toastId });
        }
    };
    
    if (loading) return <div>Loading menu...</div>;
    if (!menuDetails) return <div>Menu not found.</div>;

    return (
        <div className="w-full min-h-screen bg-brand-background-light">
            <ManagerNavbar />
            <main className="container mx-auto max-w-5xl px-4 md:px-6 py-12">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="text-gray-600">Editing Menu:</p>
                        <h1 className="text-4xl font-bold text-brand-primary">{menuDetails.menuName}</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/manager/menu" className="text-sm font-medium text-gray-700 hover:text-brand-primary">&larr; Back to All Menus</Link>
                        <Button onClick={() => setIsModalOpen(true)}>+ Add Item to this Menu</Button>
                    </div>
                </div>

                <div className="bg-white p-6 mt-8 rounded-lg shadow-md">
                     {menuDetails.items && menuDetails.items.length > 0 ? (
                        menuDetails.items.map(item => <MenuItemRow key={item.id} item={item} />)
                     ) : (
                        <p className="text-center text-gray-500 py-8">This menu has no items yet. Add your first one!</p>
                     )}
                </div>
            </main>

            <AddMenuItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddItem}
                allergens={allergens}
                dietTypes={dietTypes}
            />
        </div>
    );
}