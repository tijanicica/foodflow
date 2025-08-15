import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAddress } from '@/services/api';
import { geocodeAddress } from '@/services/geocoding';
import toast from 'react-hot-toast';
import { Loader2, Home, Briefcase, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

//================================================================================
// GLAVNA KOMPONENTA MODALA
//================================================================================

export const EditAddressModal = ({ isOpen, onClose, onAddressUpdated, addressData }) => {
    const [address, setAddress] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNickname, setSelectedNickname] = useState('');
    const [otherNickname, setOtherNickname] = useState('');
    
    useEffect(() => {
        if (isOpen && addressData) {
            // Popunjavamo osnovne podatke o adresi
            setAddress({
                street: addressData.street || '',
                streetNumber: addressData.streetNumber || '',
                city: addressData.city || '',
                postalCode: addressData.postalCode || '',
                country: addressData.country || 'Serbia',
            });

            // Pametno postavljamo stanje za nadimak
            const knownNicknames = ['Home', 'Work'];
            const nickname = addressData.nickname || '';

            if (knownNicknames.includes(nickname)) {
                setSelectedNickname(nickname);
                setOtherNickname('');
            } else if (nickname) {
                setSelectedNickname('Other');
                setOtherNickname(nickname);
            } else {
                setSelectedNickname('');
                setOtherNickname('');
            }
        }
    }, [isOpen, addressData]);

    const handleChange = (e) => {
        setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNicknameSelect = (nickname) => {
        setSelectedNickname(nickname);
        if (nickname !== 'Other') {
            setOtherNickname('');
        }
    };

    const handleUpdate = async () => {
        const finalNickname = selectedNickname === 'Other' ? otherNickname : selectedNickname;
        const addressToUpdate = { ...address, nickname: finalNickname };

        // Validacija
        for (const key of ['street', 'streetNumber', 'city', 'postalCode', 'country']) {
            if (!addressToUpdate[key]?.trim()) {
                const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
                return toast.error(`Please fill out the ${formattedKey} field.`);
            }
        }
        if (selectedNickname === 'Other' && !finalNickname.trim()) {
            return toast.error("Please enter a nickname for 'Other'.");
        }
        
        setIsLoading(true);
        try {
            const coordinates = await geocodeAddress(addressToUpdate);
            const finalAddressData = { ...addressToUpdate, ...coordinates };

            await updateAddress(addressData.id, finalAddressData);
            toast.success("Address updated successfully!");
            onAddressUpdated();
            onClose();
        } catch (error) {
            toast.error(error.message || "An error occurred while updating the address.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Edit Address</DialogTitle>
                    <DialogDescription>
                        Make changes to your saved address. Coordinates will be re-verified.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nickname (optional)</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {[{name: 'Home', icon: <Home/>}, {name: 'Work', icon: <Briefcase/>}, {name: 'Other', icon: <Building/>}].map(nick => (
                                <Button key={nick.name} variant={selectedNickname === nick.name ? "default" : "outline"}
                                    onClick={() => handleNicknameSelect(nick.name)}
                                    className={`flex-1 ${selectedNickname === nick.name && 'bg-brand-primary'}`}>
                                    {nick.icon} <span className="ml-2 hidden sm:inline">{nick.name}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence>
                        {selectedNickname === 'Other' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <div className="space-y-2 pt-2">
                                    <Label htmlFor="otherNickname">Custom Nickname</Label>
                                    <Input id="otherNickname" name="otherNickname" value={otherNickname} onChange={(e) => setOtherNickname(e.target.value)} placeholder="e.g., Mom's House" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="col-span-2"><Label htmlFor="street">Street</Label><Input id="street" name="street" value={address.street || ''} onChange={handleChange} /></div>
                        <div><Label htmlFor="streetNumber">Number</Label><Input id="streetNumber" name="streetNumber" value={address.streetNumber || ''} onChange={handleChange} /></div>
                        <div><Label htmlFor="postalCode">Postal Code</Label><Input id="postalCode" name="postalCode" value={address.postalCode || ''} onChange={handleChange} /></div>
                        <div className="col-span-2"><Label htmlFor="city">City</Label><Input id="city" name="city" value={address.city || ''} onChange={handleChange} /></div>
                        <div className="col-span-2"><Label htmlFor="country">Country</Label><Input id="country" name="country" value={address.country || ''} onChange={handleChange} /></div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleUpdate} disabled={isLoading} className="bg-brand-primary hover:bg-brand-primary/90 w-32">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};