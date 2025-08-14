import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from 'react-hot-toast';
import { updateAddress } from '@/services/api';


export const EditAddressModal = ({ isOpen, onClose, onAddressUpdated, addressData }) => {
    // Stanje forme
    const [address, setAddress] = useState({
        street: '', streetNumber: '', city: '', postalCode: '', nickname: ''
    });

    // === KLJUČNA IZMENA JE OVDE ===
    // Ovaj useEffect se pokreće svaki put kada se modal otvori (kada se promeni 'addressData')
    useEffect(() => {
        // Popuni formu samo ako postoje podaci za izmenu
        if (addressData) {
            setAddress({
                street: addressData.street || '',
                streetNumber: addressData.streetNumber || '',
                city: addressData.city || '',
                postalCode: addressData.postalCode || '',
                nickname: addressData.nickname || '',
                // Važno: Ne prenosimo 'country' ako ga ne prikazujemo u formi
            });
        }
    }, [addressData]); // Zavisnost je 'addressData'

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        // Validacija
        if (!address.street || !address.streetNumber || !address.city || !address.postalCode) {
            return toast.error("Please fill in all required address fields.");
        }

        try {
            // Koristimo ID iz originalnih podataka
            await updateAddress(addressData.id, address);

            toast.success("Address updated successfully!");
            onAddressUpdated(); // Javi roditelju da osveži podatke
            onClose(); // Zatvori modal
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    };
    
    // Resetuj stanje kada se modal zatvori
    const handleClose = () => {
        setAddress({ street: '', streetNumber: '', city: '', postalCode: '', nickname: '' });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Address</DialogTitle>
                      <DialogDescription>
                      Make changes to your saved address here. Click save when you're done.
                      </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-1">
                        <Label htmlFor="street">Street</Label>
                        <Input id="street" name="street" value={address.street} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="streetNumber">Street Number</Label>
                        <Input id="streetNumber" name="streetNumber" value={address.streetNumber} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" name="city" value={address.city} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input id="postalCode" name="postalCode" value={address.postalCode} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="nickname">Nickname (e.g., Home, Work)</Label>
                        <Input id="nickname" name="nickname" value={address.nickname} onChange={handleChange} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleUpdate}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};