import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getMyProfile, deleteCard, updatePhoneNumber, setActiveCard } from '@/services/api';
import toast from 'react-hot-toast';
import { Edit, Save, X, Trash2, CheckCircle2 } from 'lucide-react';
import { AddNewAddressModal } from '@/components/modals/AddNewAddressModal';
import { AddNewCardModal } from '@/components/modals/AddNewCardModal';
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal';
import { EditAddressModal } from '@/components/modals/EditAddressModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProfileSection } from '@/components/ProfileSection'; // Importujemo novu komponentu

// --- POMOĆNE KOMPONENTE ---
const InfoRow = ({ label, children }) => (
    <div className="flex items-center py-2 min-h-[40px]">
        <p className="w-32 text-sm text-gray-500 flex-shrink-0">{label}</p>
        <div className="flex-grow">{children}</div>
    </div>
);

// --- GLAVNA KOMPONENTA ---
export function MyProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(null);
    
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [phone, setPhone] = useState('');
    
    const [editingAddress, setEditingAddress] = useState(null);

    const fetchProfile = async () => {
        try {
            const data = await getMyProfile();
            setProfile(data);
            setPhone(data.phone);
        } catch {
            toast.error("Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handlePhoneSave = async () => {
        if (phone === profile?.phone) return setIsEditingPhone(false);
        try {
            await updatePhoneNumber(phone);
            setProfile(prev => ({ ...prev, phone }));
            toast.success("Phone number updated!");
            setIsEditingPhone(false);
        } catch {
            toast.error("Failed to update phone number.");
        }
    };

    const handleCardDeleted = (cardId) => {
        setProfile(prev => ({ ...prev, paymentMethods: prev.paymentMethods.filter(card => card.id !== cardId) }));
        toast.success("Card removed.");
    };

    const handleSetActiveCard = async (cardId) => {
        try {
            await setActiveCard(cardId);
            setProfile(prev => ({
                ...prev,
                paymentMethods: prev.paymentMethods.map(card => ({ ...card, active: card.id === cardId }))
            }));
            toast.success("Default card updated!");
        } catch {
            toast.error("Failed to update card.");
        }
    };

    const handleAddressChange = () => {
        fetchProfile();
        setModalOpen(null);
        setEditingAddress(null);
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!profile) return <div className="flex justify-center items-center h-screen">Could not load profile data.</div>;

    return (
        <>
            <div className="w-full min-h-screen bg-[#F9F5EC]">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    <h1 className="text-4xl font-bold text-[#4A4A4A] mb-8">My Profile</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Leva kolona */}
                        <div className="space-y-8">
                            <ProfileSection title="Personal Information">
                                <InfoRow label="Full Name:">
                                    <p className="text-gray-800 font-medium">{profile.fullName}</p>
                                </InfoRow>
                                <InfoRow label="Email:">
                                    <p className="text-gray-800 font-medium">{profile.email}</p>
                                </InfoRow>
                                <InfoRow label="Phone Number:">
                                    {isEditingPhone ? (
                                        <div className="flex items-center gap-2">
                                            <Input value={phone} onChange={e => setPhone(e.target.value)} className="w-48" />
                                            <Button size="icon" onClick={handlePhoneSave} className="bg-green-500 hover:bg-green-600"><Save size={16} /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => { setIsEditingPhone(false); setPhone(profile.phone); }}><X size={16} /></Button>
                                        </div>
                                    ) : (
                                          // Deo za prikaz je sada promenjen
                                        <div className="flex items-center justify-between w-full">
                                            <p className="text-gray-800 font-medium">{profile.phone}</p>
                                            <Button 
                                                variant="ghost"
                                                size="icon"
                                                className="text-[#D4A056] h-8 w-8"
                                                onClick={() => setIsEditingPhone(true)}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                        </div>
                                    )}
                                </InfoRow>
                            </ProfileSection>

                            <ProfileSection title="Security">
                                <InfoRow label="Password:">
                                    <div className="flex items-center gap-4">
                                        <p className="text-gray-800 font-medium">••••••••••</p>
                                        <Button variant="link" className="p-0 h-auto text-sm text-[#D4A056]" onClick={() => setModalOpen('password')}>Change</Button>
                                    </div>
                                </InfoRow>
                            </ProfileSection>
                        </div>

                        {/* Desna kolona */}
                        <div className="space-y-8">
                            <ProfileSection title="Saved Addresses">
                                {(profile?.savedAddresses || []).map(address => (
                                    <div key={address.id} className="flex justify-between items-center py-1">
                                        <p className="text-gray-800">{address.fullAddress}</p>
                                      <Button 
                                        variant="ghost" // 'ghost' varijanta da nema pozadinu
                                        size="icon"      // 'icon' varijanta za kvadratni oblik
                                        className="text-[#D4A056] h-8 w-8" // Malo smanjujemo veličinu
                                        onClick={() => {
                                            setEditingAddress(address); 
                                            setModalOpen('editAddress'); 
                                        }}
                                    >
                                        {/* Koristimo 'Edit' ikonicu iz lucide-react */}
                                        <Edit size={16} /> 
                                    </Button>
                                    </div>
                                ))}
                                <Button variant="link" className="p-0 h-auto mt-3 text-[#D4A056]" onClick={() => { setEditingAddress(null); setModalOpen('address'); }}>
                                    + Add New Address
                                </Button>
                            </ProfileSection>

                            <ProfileSection title="Payment Methods">
                                <TooltipProvider>
                                    {(profile?.paymentMethods || []).map(card => (
                                        <div key={card.id} className={`flex justify-between items-center border p-3 rounded-md transition-colors ${card.active ? 'bg-green-50 border-green-400' : 'bg-white'}`}>
                                            <div className="flex items-center gap-3">
                                                {card.active && <CheckCircle2 className="text-green-500" />}
                                                <span className="font-mono">{card.maskedNumber}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!card.active && <Button variant="link" className="p-0 h-auto text-sm text-blue-600" onClick={() => handleSetActiveCard(card.id)}>Set as default</Button>}
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span tabIndex="0">
                                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 disabled:text-gray-400 disabled:cursor-not-allowed" disabled={card.active} onClick={() => deleteCard(card.id).then(() => handleCardDeleted(card.id))}>
                                                                <Trash2 size={18}/>
                                                            </Button>
                                                        </span>
                                                    </TooltipTrigger>
                                                    {card.active && (<TooltipContent><p>Cannot delete the active card.</p></TooltipContent>)}
                                                </Tooltip>
                                            </div>
                                        </div>
                                    ))}
                                </TooltipProvider>
                                <Button variant="link" className="p-0 h-auto mt-3 text-[#D4A056]" onClick={() => setModalOpen('card')}>+ Add New Card</Button>
                            </ProfileSection>
                        </div>
                    </div>
                </main>
            </div>
            
            {/* Modali */}
            <AddNewAddressModal isOpen={modalOpen === 'address'} onClose={() => setModalOpen(null)} onAddressSaved={handleAddressChange} />
            <AddNewCardModal isOpen={modalOpen === 'card'} onClose={() => setModalOpen(null)} onCardAdded={(newCard) => setProfile(prev => ({...prev, paymentMethods: [...prev.paymentMethods, newCard]}))} />
            <ChangePasswordModal isOpen={modalOpen === 'password'} onClose={() => setModalOpen(null)} />
            
            {editingAddress && (
                <EditAddressModal 
                    isOpen={modalOpen === 'editAddress'} 
                    onClose={() => { setModalOpen(null); setEditingAddress(null); }}
                    onAddressUpdated={handleAddressChange}
                    addressData={editingAddress}
                />
            )}
        </>
    );
}