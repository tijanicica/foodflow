import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { addNewAddress } from "@/services/api";
import toast from "react-hot-toast";

import { geocodeAddress } from '@/services/geocoding'; // 1. Uvozimo geokoder

export const AddNewAddressModal = ({ isOpen, onClose, onAddressAdded }) => {
    const initialState = {
        country: 'Serbia', // Postavimo podrazumevanu vrednost
        city: '',
        postalCode: '',
        street: '',
        streetNumber: '',
        nickname: ''
    };
    const [address, setAddress] = useState(initialState);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        for (const key in address) {
            if (key !== 'nickname' && !address[key]?.trim()) {
                return toast.error(`Please fill out the ${key} field.`);
            }
        }

        setIsLoading(true);
        try {
            // 2. Geokodiranje pre slanja
            const coordinates = await geocodeAddress(address);
            
            // 3. Spajanje adrese sa koordinatama
            const finalAddressData = { ...address, ...coordinates };

            const newAddress = await addNewAddress(finalAddressData); 
            toast.success("Address added successfully!");
            onAddressAdded(newAddress);
            onClose();

        } catch (error) {
            // Prikazujemo grešku iz geokodera (npr. "Address not found") ili sa servera
            toast.error(error.message || "Failed to add address.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        setAddress(initialState);
        onClose();
    };

    return (
        // Dialog komponenta kontroliše vidljivost modala
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Address</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Mapiramo kroz polja da dinamički kreiramo labele i inpute */}
                    {Object.keys(address).map(key => (
                        <div key={key} className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor={key} className="text-right capitalize">
                                {key.replace('streetNumber', 'Street Number').replace('postalCode', 'Postal Code')}
                                {key !== 'nickname' && <span className="text-red-500">*</span>}
                            </Label>
                            <Input 
                                id={key} 
                                name={key} 
                                value={address[key]} 
                                onChange={handleChange} 
                                className="col-span-3"
                            />
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Address'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};