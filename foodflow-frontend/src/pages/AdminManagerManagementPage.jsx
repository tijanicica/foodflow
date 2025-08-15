import React, { useState, useEffect } from 'react';
import { AdminNavbar } from '@/components/AdminNavbar';
import { Button } from '@/components/ui/button';
import { getAllManagers, registerManager, updateManager } from '@/services/api';
import toast from 'react-hot-toast';
import { RegisterManagerModal } from '@/components/modals/RegisterManagerModal';
import { EditManagerModal } from '@/components/modals/EditManagerModal';

const ManagerRow = ({ manager, onEdit }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
        <div>
            <p className="font-semibold">{manager.fullName}</p>
            <p className="text-sm text-gray-500">{manager.email}</p>
        </div>
        <button onClick={() => onEdit(manager.id)} className="text-sm font-medium text-brand-primary hover:underline">Edit</button>
    </div>
);

export function AdminManagerManagementPage() {
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedManagerId, setSelectedManagerId] = useState(null);

    const fetchManagers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllManagers();
            setManagers(data);
        } catch (err) {
            console.error("Failed to fetch managers:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to load managers.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManagers();
    }, []);

    const handleRegister = async (managerData) => {
        const toastId = toast.loading('Registering new manager...');
        try {
            await registerManager(managerData);
            toast.success('Manager registered successfully!', { id: toastId });
            setRegisterModalOpen(false);
            fetchManagers();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed.';
            toast.error(errorMessage, { id: toastId });
        }
    };

    // ===== FUNKCIJE KOJE SU NEDOSTAJALE =====
    const handleEditClick = (id) => {
        setSelectedManagerId(id);
        setEditModalOpen(true);
    };

    const handleUpdate = async (id, data) => {
        const toastId = toast.loading('Updating manager...');
        try {
            await updateManager(id, data);
            toast.success('Manager updated successfully!', { id: toastId });
            setEditModalOpen(false);
            fetchManagers();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Update failed.';
            toast.error(errorMessage, { id: toastId });
        }
    };
    // =====================================

    const renderContent = () => {
        if (loading) {
            return <p className="text-center text-gray-500 py-8">Loading managers...</p>;
        }
        if (error) {
            return <p className="text-center text-red-500 py-8">Error: {error}</p>;
        }
        if (managers.length === 0) {
            return <p className="text-center text-gray-500 py-8">No managers found. Register the first one!</p>;
        }
        return managers.map(m => <ManagerRow key={m.id} manager={m} onEdit={handleEditClick} />);
    };

    return (
        <div className="w-full min-h-screen bg-brand-background-light">
            <AdminNavbar />
            <main className="container mx-auto max-w-4xl px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-brand-primary">Manager Management</h1>
                    <Button onClick={() => setRegisterModalOpen(true)}>+ Register New Manager</Button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between text-sm font-semibold text-gray-500 border-b pb-2 mb-2">
                        <span>Manager Name</span>
                        <span>Email</span>
                    </div>
                    {renderContent()}
                </div>
            </main>
            
            <RegisterManagerModal 
                isOpen={isRegisterModalOpen}
                onClose={() => setRegisterModalOpen(false)}
                onSubmit={handleRegister}
            />

            {isEditModalOpen && (
                <EditManagerModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setEditModalOpen(false)} 
                    onSubmit={handleUpdate}
                    managerId={selectedManagerId}
                />
            )}
        </div>
    );
}