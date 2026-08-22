// src/pages/ManagerProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar';
import { getManagerProfile, updateManagerProfile, changeManagerPassword } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

// Ikonice za prelep izgled
import { User, Mail, Phone, Lock, Heart, Edit, X } from 'lucide-react';

// === Redizajniran Modal za promenu lozinke ===
const ChangePasswordModal = ({ onClose, onSubmit }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ oldPassword, newPassword, confirmPassword });
    };

    const commonInputStyles = "w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-colors duration-200";

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-modal-show">
            <form onSubmit={handleSubmit} className="bg-white flex flex-col rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex-shrink-0 p-6 flex justify-between items-center bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-t-2xl">
                    <h2 className="text-2xl font-bold">Promenite Lozinku</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8 space-y-4">
                    <Input type="password" placeholder="Stara lozinka" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className={commonInputStyles} />
                    <Input type="password" placeholder="Nova lozinka" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className={commonInputStyles} />
                    <Input type="password" placeholder="Potvrdite novu lozinku" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={commonInputStyles} />
                </div>
                <div className="flex-shrink-0 p-6 flex justify-end gap-4 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="bg-gray-100 text-gray-800 font-bold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">Otkaži</button>
                    <button type="submit" className="bg-pink-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-pink-700 transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transform hover:-translate-y-0.5">Sačuvaj</button>
                </div>
            </form>
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
            } catch (error) { toast.error("Neuspešno učitavanje profila."); } 
            finally { setLoading(false); }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        await toast.promise(updateManagerProfile({ phone }), {
            loading: 'Čuvanje...', success: 'Profil uspešno ažuriran!', error: 'Greška pri ažuriranju.'
        });
    };

    const handlePasswordChange = async (passwordData) => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Nove lozinke se ne poklapaju!");
            return;
        }
        await toast.promise(changeManagerPassword(passwordData), {
            loading: 'Promena lozinke...',
            success: () => {
                setIsModalOpen(false); // Zatvori modal samo ako je uspešno
                return 'Lozinka uspešno promenjena!';
            },
            error: (err) => err.response?.data?.message || 'Greška pri promeni lozinke.'
        });
    };

    const LoadingSpinner = () => (<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div></div>);

    return (
        <div className="w-full min-h-screen bg-pink-50/50">
            <ManagerNavbar />

            <div className="relative bg-gradient-to-br from-pink-500 to-purple-600 text-white py-12 px-4 overflow-hidden">
                <Heart size={48} className="absolute top-10 left-10 opacity-10 heart-float" style={{ animationDelay: '0s' }}/>
                <Heart size={24} className="absolute top-20 right-20 opacity-10 heart-float" style={{ animationDelay: '1s' }}/>
                <Heart size={36} className="absolute bottom-10 left-1/3 opacity-10 heart-float" style={{ animationDelay: '2.5s' }}/>
                <Heart size={20} className="absolute bottom-16 right-1/4 opacity-10 heart-float" style={{ animationDelay: '4s' }}/>

                <div className="container mx-auto text-center relative z-10">
                    <h1 className="text-4xl font-bold">Dobrodošli, {profile?.fullName?.split(' ')[0] || 'Menadžeru'}!</h1>
                    <p className="mt-2 opacity-80">Pregledajte i upravljajte vašim profilom.</p>
                </div>
            </div>

            <main className="container mx-auto max-w-2xl px-4 md:px-6 py-12">
                {loading || !profile ? <LoadingSpinner /> : (
                    <div className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/50">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3"><User className="text-pink-600"/>Vaš Profil</h2>
                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-4"><Label className="text-sm text-gray-500">Ime i Prezime</Label><p className="text-lg text-gray-800 mt-1">{profile.fullName}</p></div>
                            <div className="border-b border-gray-200 pb-4"><Label className="text-sm text-gray-500">Email Adresa</Label><p className="text-lg text-gray-800 mt-1">{profile.email}</p></div>
                            <div className="border-b border-gray-200 pb-4"><Label className="text-sm text-gray-500">Adresa</Label><p className="text-lg text-gray-800 mt-1">{profile.address || 'Nije uneta'}</p></div>
                            <div>
                                <Label htmlFor="phone" className="text-sm text-gray-500">Broj Telefona</Label>
                                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-pink-400 focus:border-pink-400" />
                            </div>
                            <div className="pt-6 flex items-center gap-4">
                                <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 flex-1 bg-gray-100 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"><Lock size={18}/> Promeni Lozinku</button>
                                <button onClick={handleSave} className="flex items-center justify-center gap-2 flex-1 bg-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transform hover:-translate-y-0.5"><Edit size={18}/> Sačuvaj Izmene</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {isModalOpen && <ChangePasswordModal onSubmit={handlePasswordChange} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}