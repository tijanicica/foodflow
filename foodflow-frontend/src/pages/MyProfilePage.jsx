import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getMyProfile, deleteCard, updatePhoneNumber, setActiveCard } from '@/services/api';
import toast from 'react-hot-toast';
import { Edit, Save, X, Trash2, CheckCircle2, User, KeyRound, MapPin, CreditCard, PlusCircle } from 'lucide-react';
import { AddNewAddressModal } from '@/components/modals/AddNewAddressModal';
import { AddNewCardModal } from '@/components/modals/AddNewCardModal';
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal';
import { EditAddressModal } from '@/components/modals/EditAddressModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Footer } from '@/components/Footer'; // <-- 1. UVOZ FUTERA


// --- POMOĆNE KOMPONENTE ---

const ProfileSection = ({ title, icon, action, children }) => (
    <div className="bg-white rounded-xl shadow-sm border">
        <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center gap-3">
                {icon}
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            </div>
            {action}
        </div>
        <div className="p-4 space-y-4">{children}</div>
    </div>
);

const InfoRow = ({ label, children }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-2 border-b last:border-b-0">
        <p className="w-32 text-sm text-gray-500 font-medium flex-shrink-0 mb-1 sm:mb-0">{label}</p>
        <div className="flex-grow w-full">{children}</div>
    </div>
);

const AddressCard = ({ address, onEdit }) => (
    <div className="flex justify-between items-start p-3 rounded-lg bg-gray-50 border">
        <div>
            <p className="font-semibold text-gray-800">{address.nickname || 'Address'}</p>
            <p className="text-sm text-gray-600">{address.fullAddress}</p>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-500 h-8 w-8 flex-shrink-0" onClick={onEdit}>
            <Edit size={16} />
        </Button>
    </div>
);

const PaymentCard = ({ card, onSetActive, onDelete }) => (
    <div className={`flex justify-between items-center border p-3 rounded-lg transition-colors ${card.active ? 'bg-green-50 border-green-300' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-3">
            {card.active && <CheckCircle2 className="text-green-500 flex-shrink-0" />}
            <div>
                <span className="font-mono font-semibold text-gray-800">{card.maskedNumber}</span>
                <p className="text-xs text-gray-500">{card.cardType}</p>
            </div>
        </div>
        <div className="flex items-center gap-1">
            {!card.active && <Button variant="link" className="p-1 h-auto text-sm text-blue-600" onClick={onSetActive}>Set default</Button>}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span tabIndex="0">
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 disabled:text-gray-400 disabled:cursor-not-allowed h-8 w-8" disabled={card.active} onClick={onDelete}>
                                <Trash2 size={16}/>
                            </Button>
                        </span>
                    </TooltipTrigger>
                    {card.active && (<TooltipContent><p>Cannot delete the active card.</p></TooltipContent>)}
                </Tooltip>
            </TooltipProvider>
        </div>
    </div>
);

const ProfilePageSkeleton = () => (
    <div className="w-full min-h-screen bg-[#F9F5EC]">
        <Navbar />
        <main className="container mx-auto px-4 py-8 animate-pulse">
            <div className="h-10 w-48 bg-gray-200 rounded-md mb-8"></div>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
                    <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                    <div className="h-5 w-full bg-gray-100 rounded"></div>
                    <div className="h-5 w-full bg-gray-100 rounded"></div>
                    <div className="h-5 w-full bg-gray-100 rounded"></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
                    <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                    <div className="h-12 w-full bg-gray-100 rounded-lg"></div>
                    <div className="h-12 w-full bg-gray-100 rounded-lg"></div>
                </div>
            </div>
        </main>
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

    const fetchProfile = useCallback(async () => {
        try {
            const data = await getMyProfile();
            setProfile(data);
            setPhone(data.phone || '');
        } catch {
            toast.error("Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

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

    if (loading) return <ProfilePageSkeleton />;
    if (!profile) return <div className="flex justify-center items-center h-screen">Could not load profile data.</div>;

    return (
        <>
            <div className="w-full min-h-screen bg-[#F9F5EC]">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-[#4A4A4A]">My Profile</h1>
                        <p className="text-lg text-gray-500 mt-1">Manage your account details, addresses, and payment methods.</p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Personal Information Section */}
                        <ProfileSection title="Personal Information" icon={<User className="text-[#D4A056]" />}>
                            <InfoRow label="Full Name"><p className="text-gray-800 font-medium">{profile.fullName}</p></InfoRow>
                            <InfoRow label="Email"><p className="text-gray-800 font-medium">{profile.email}</p></InfoRow>
                            <InfoRow label="Phone Number">
                                {isEditingPhone ? (
                                    <div className="flex items-center gap-2">
                                        <Input value={phone} onChange={e => setPhone(e.target.value)} className="max-w-xs" />
                                        <Button size="icon" onClick={handlePhoneSave} className="bg-green-500 hover:bg-green-600"><Save size={16} /></Button>
                                        <Button size="icon" variant="ghost" onClick={() => { setIsEditingPhone(false); setPhone(profile.phone); }}><X size={16} /></Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between w-full">
                                        <p className="text-gray-800 font-medium">{profile.phone || 'Not set'}</p>
                                        <Button variant="ghost" size="icon" className="text-gray-500 h-8 w-8" onClick={() => setIsEditingPhone(true)}><Edit size={16} /></Button>
                                    </div>
                                )}
                            </InfoRow>
                        </ProfileSection>

                        {/* Saved Addresses Section */}
                        <ProfileSection 
                            title="Saved Addresses" 
                            icon={<MapPin className="text-[#D4A056]" />}
                            action={
                                <Button variant="outline" size="sm" onClick={() => { setEditingAddress(null); setModalOpen('address'); }}>
                                    <PlusCircle size={16} className="mr-2" /> Add New
                                </Button>
                            }
                        >
                            {(profile?.savedAddresses || []).length > 0 ? (
                                (profile.savedAddresses).map(address => (
                                    <AddressCard 
                                        key={address.id} 
                                        address={address} 
                                        onEdit={() => { setEditingAddress(address); setModalOpen('editAddress'); }} 
                                    />
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">No saved addresses yet.</p>
                            )}
                        </ProfileSection>

                        {/* Payment Methods Section */}
                         <ProfileSection 
                            title="Payment Methods" 
                            icon={<CreditCard className="text-[#D4A056]" />}
                            action={
                                <Button variant="outline" size="sm" onClick={() => setModalOpen('card')}>
                                    <PlusCircle size={16} className="mr-2" /> Add New
                                </Button>
                            }
                        >
                            {(profile?.paymentMethods || []).length > 0 ? (
                                (profile.paymentMethods).map(card => (
                                    <PaymentCard 
                                        key={card.id} 
                                        card={card} 
                                        onSetActive={() => handleSetActiveCard(card.id)} 
                                        onDelete={() => deleteCard(card.id).then(() => handleCardDeleted(card.id))}
                                    />
                                ))
                             ) : (
                                <p className="text-center text-gray-500 py-4">No saved cards yet.</p>
                            )}
                        </ProfileSection>

                        {/* Security Section */}
                        <ProfileSection title="Security" icon={<KeyRound className="text-[#D4A056]" />}>
                            <InfoRow label="Password">
                                <div className="flex items-center justify-between w-full">
                                    <p className="text-gray-800 font-medium tracking-widest">••••••••</p>
                                    <Button variant="link" className="p-0 h-auto text-sm text-[#D4A056]" onClick={() => setModalOpen('password')}>Change Password</Button>
                                </div>
                            </InfoRow>
                        </ProfileSection>
                    </div>
                </main>
            </div>
            
            {/* Modali */}
            <AddNewAddressModal isOpen={modalOpen === 'address'} onClose={() => setModalOpen(null)} onAddressAdded={handleAddressChange} />

            
            <AddNewCardModal isOpen={modalOpen === 'card'} onClose={() => setModalOpen(null)} onCardAdded={(newCard) => setProfile(prev => ({...prev, paymentMethods: [...prev.paymentMethods, newCard]}))} />
            <ChangePasswordModal isOpen={modalOpen === 'password'} onClose={() => setModalOpen(null)} />
            {editingAddress && (<EditAddressModal isOpen={modalOpen === 'editAddress'} onClose={() => { setModalOpen(null); setEditingAddress(null); }} onAddressUpdated={handleAddressChange} addressData={editingAddress}/>)}
                               <Footer /> {/* <-- 2. DODAVANJE FUTERA NA DNO STRANICE */}
       
        </>
        
    );
}