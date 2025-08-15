import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from 'react-hot-toast';
import { updateAddress } from '@/services/api';
import { geocodeAddress } from '@/services/geocoding'; // 1. Uvozimo geokoder

export const EditAddressModal = ({ isOpen, onClose, onAddressUpdated, addressData }) => {
    const [address, setAddress] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (addressData) {
            setAddress({
                id: addressData.id,          // Dodaj ovo
                street: addressData.street || '',
                streetNumber: addressData.streetNumber || '',
                city: addressData.city || '',
                postalCode: addressData.postalCode || '',
                country: addressData.country || 'Srbija',
                nickname: addressData.nickname || '',
            });
        }
    }, [addressData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!address.street || !address.streetNumber || !address.city || !address.postalCode) {
            return toast.error("Please fill in all required address fields.");
        }

        setIsLoading(true);
        try {
            // 2. Geokodiranje pre slanja
            const coordinates = await geocodeAddress(address);
            
            // 3. Spajanje adrese sa koordinatama
            const finalAddressData = { ...address, ...coordinates };

            await updateAddress(addressData.id, finalAddressData);

            toast.success("Address updated successfully!");
            onAddressUpdated();
            onClose();
        } catch (error) {
            // Prikazujemo grešku iz geokodera ili sa servera
            toast.error(error.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        setAddress({}); // Resetuj formu na prazan objekat
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Address</DialogTitle>
                    <DialogDescription>
                        Make changes to your saved address here. Coordinates will be re-verified upon saving.
                    </DialogDescription>
                </DialogHeader>
                {/* Vaš postojeći JSX ostaje isti, samo dodajemo 'country' */}
                <div className="space-y-4 py-4">
                    <div className="space-y-1">
                        <Label htmlFor="street">Street</Label>
                        <Input id="street" name="street" value={address.street || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="streetNumber">Street Number</Label>
                        <Input id="streetNumber" name="streetNumber" value={address.streetNumber || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" name="city" value={address.city || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input id="postalCode" name="postalCode" value={address.postalCode || ''} onChange={handleChange} />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" name="country" value={address.country || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="nickname">Nickname (e.g., Home, Work)</Label>
                        <Input id="nickname" name="nickname" value={address.nickname || ''} onChange={handleChange} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleUpdate} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};