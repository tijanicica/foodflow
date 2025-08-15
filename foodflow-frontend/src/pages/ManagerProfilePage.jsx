// src/pages/ManagerProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar';
import { getManagerProfile, updateManagerProfile, changeManagerPassword } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

// Komponenta za polje koje se ne može menjati
const ProfileField = ({ label, value }) => (
    <div className="border-b border-gray-200 pb-4">
        <Label className="text-sm text-gray-500">{label}</Label>
        <p className="text-lg text-brand-primary mt-1">{value}</p>
    </div>
);

// Modal za promenu lozinke (prikazuje se uslovno)
const ChangePasswordModal = ({ onClose, onSubmit }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ oldPassword, newPassword, confirmPassword });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Change Password</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input type="password" placeholder="Old Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                    <Input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    <Input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export function ManagerProfilePage() {
    const [profile, setProfile] = useState(null);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getManagerProfile();
                setProfile(data);
                setPhone(data.phone);
            } catch (error) {
                toast.error("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        const toastId = toast.loading('Saving...');
        try {
            await updateManagerProfile({ phone });
            toast.success('Profile updated successfully!', { id: toastId });
        } catch (error) {
            toast.error('Failed to update profile.', { id: toastId });
        }
    };

    const handlePasswordChange = async (passwordData) => {
        const toastId = toast.loading('Changing password...');
        try {
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                throw new Error("Passwords do not match!");
            }
            await changeManagerPassword(passwordData);
            toast.success('Password changed successfully!', { id: toastId });
            setIsModalOpen(false);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to change password.';
            toast.error(errorMessage, { id: toastId });
        }
    };

    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (!profile) {
        return <div>Could not load profile data.</div>;
    }

    return (
        <div className="w-full min-h-screen bg-brand-background-light">
            <ManagerNavbar />
            <main className="container mx-auto max-w-3xl px-4 md:px-6 py-12">
                <h1 className="text-4xl font-bold text-brand-primary mb-10">My Profile</h1>
                
                <div className="space-y-6">
                    <ProfileField label="Full Name" value={profile.fullName} />
                    
                    <div className="border-b border-gray-200 pb-4">
                         <Label htmlFor="phone" className="text-sm text-gray-500">Phone Number</Label>
                         <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-transparent border-none p-0 h-auto text-lg focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                         />
                    </div>
                    
                    <ProfileField label="Address" value={profile.address} />
                    <ProfileField label="Email Address" value={profile.email} />

                    <div className="pt-6 flex items-center gap-4">
                        <Button
                            variant="outline"
                            className="bg-transparent border-brand-accent text-brand-primary hover:bg-brand-accent/10"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Change Password
                        </Button>
                        <Button
                            className="bg-brand-primary hover:bg-brand-primary/90"
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </main>

            {isModalOpen && <ChangePasswordModal onSubmit={handlePasswordChange} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}