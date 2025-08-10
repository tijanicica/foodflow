import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { addNewAddress } from "@/services/api";
import toast from "react-hot-toast";

export const AddNewAddressModal = ({ isOpen, onClose, onAddressAdded }) => {
    // Stanje za čuvanje vrednosti iz input polja
    const initialState = {
        country: '',
        city: '',
        postalCode: '',
        street: '',
        streetNumber: '',
        nickname: '' // Opciono polje za nadimak
    };
    const [address, setAddress] = useState(initialState);
    const [isLoading, setIsLoading] = useState(false);

    // Funkcija koja ažurira stanje pri promeni u input polju
    const handleChange = (e) => {
        setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Funkcija koja se poziva pri čuvanju adrese
    const handleSave = async () => {
        // Jednostavna validacija - proverava da li su obavezna polja (sva osim nickname) popunjena
        for (const key in address) {
            if (key !== 'nickname' && !address[key].trim()) {
                toast.error(`Please fill out the ${key.replace('streetNumber', 'Street Number')} field.`);
                return;
            }
        }

        setIsLoading(true);
        try {
            // Pozivamo API funkciju sa podacima iz stanja
            const newAddress = await addNewAddress(address); 
            toast.success("Address added successfully!");
            
            // Pozivamo callback funkciju prosleđenu od roditeljske komponente
            // i šaljemo joj ceo objekat nove adrese
            onAddressAdded(newAddress);
            
            // Zatvaramo modal
            onClose();

            // Resetujemo formu za sledeći put
            setAddress(initialState);

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add address.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Funkcija za zatvaranje modala
    const handleClose = () => {
        setAddress(initialState); // Resetuj formu i pri zatvaranju
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