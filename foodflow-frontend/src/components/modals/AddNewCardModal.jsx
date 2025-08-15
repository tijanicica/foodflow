import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addNewCard } from '@/services/api';
import toast from 'react-hot-toast';
import { Loader2, AlertCircle } from 'lucide-react';

// Uvozimo novu biblioteku
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';

//================================================================================
// GLAVNA KOMPONENTA MODALA
//================================================================================

export const AddNewCardModal = ({ isOpen, onClose, onCardAdded }) => {
    const [state, setState] = useState({
        number: '',
        expiry: '',
        cvc: '',
        name: '', // Iako ga ne koristimo, potreban je za biblioteku
        focus: '',
    });
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Resetuj stanje kada se modal otvori ili zatvori
    useEffect(() => {
        if (!isOpen) {
            setState({ number: '', expiry: '', cvc: '', name: '', focus: '' });
            setErrors({});
        }
    }, [isOpen]);

    const handleInputChange = (evt) => {
        let { name, value } = evt.target;
        // Specijalno formatiranje za 'expiry'
        if (name === 'expiry') {
            value = value.replace(/\D/g, ''); // Ukloni sve što nije broj
            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
        }
        setState((prev) => ({ ...prev, [name]: value }));
    };

    const handleInputFocus = (evt) => {
        setState((prev) => ({ ...prev, focus: evt.target.name }));
    };

    const handleAddCard = async () => {
        // Jednostavna validacija pre slanja
        if (state.number.length < 16 || state.expiry.length < 5 || state.cvc.length < 3) {
            toast.error("Please fill in all card details correctly.");
            return;
        }
        
        setIsSaving(true);
        setErrors({});
        try {
            const cardData = {
                cardNumber: state.number,
                expiryDate: state.expiry,
                cvc: state.cvc,
            };
            const newCard = await addNewCard(cardData);
            onCardAdded(newCard);
            toast.success("Card added successfully!");
            onClose();
        } catch (error) {
            const serverErrors = error.response?.data?.errors;
            if (serverErrors) {
                setErrors(serverErrors); // Prikazuje greške ispod polja
            } else {
                toast.error(error.response?.data?.message || "Failed to add card.");
            }
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Add a New Payment Card</DialogTitle>
                    <DialogDescription>
                        Your payment information is stored securely.
                    </DialogDescription>
                </DialogHeader>
                
                {/* Vizuelni prikaz kartice */}
                <div className="py-4">
                    <Cards
                        number={state.number}
                        expiry={state.expiry}
                        cvc={state.cvc}
                        name={state.name}
                        focused={state.focus}
                    />
                </div>

                {/* Forma za unos */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="number">Card Number</Label>
                        <Input 
                            type="tel" 
                            name="number" 
                            id="number" 
                            placeholder="•••• •••• •••• ••••"
                            value={state.number}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            maxLength={16}
                        />
                        {errors.cardNumber && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/> {errors.cardNumber}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input 
                                type="tel" 
                                name="expiry" 
                                id="expiry" 
                                placeholder="MM/YY"
                                value={state.expiry}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                maxLength={5}
                            />
                             {errors.expiryDate && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/> {errors.expiryDate}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input 
                                type="tel" 
                                name="cvc" 
                                id="cvc" 
                                placeholder="•••"
                                value={state.cvc}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                maxLength={4}
                            />
                            {errors.cvc && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/> {errors.cvc}</p>}
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleAddCard} disabled={isSaving} className="bg-brand-primary hover:bg-brand-primary/90 w-28">
                        {isSaving ? <Loader2 className="animate-spin" /> : 'Add Card'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};