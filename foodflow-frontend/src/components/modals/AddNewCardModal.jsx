import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { addNewCard } from '@/services/api';

export const AddNewCardModal = ({ isOpen, onClose, onCardAdded }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCvc] = useState('');
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Handler za automatsko formatiranje datuma
    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Ukloni sve što nije broj
        if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        setExpiryDate(value);
    };

    const validate = () => {
        const newErrors = {};
        if (!/^[0-9]{16}$/.test(cardNumber)) newErrors.cardNumber = "Must be 16 digits.";
        if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiryDate)) newErrors.expiryDate = "Invalid format (MM/YY).";
        if (!/^[0-9]{3,4}$/.test(cvc)) newErrors.cvc = "Must be 3 or 4 digits.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddCard = async () => {
        if (!validate()) return;
        
        setIsSaving(true);
        try {
            const newCard = await addNewCard({ cardNumber, expiryDate, cvc });
            onCardAdded(newCard);
            toast.success("Card added successfully!");
            onClose(); // Zatvori i resetuj
        } catch (error) {
            // Prikazujemo greške sa servera
            const serverErrors = error.response?.data?.errors;
            if (serverErrors) {
                setErrors(serverErrors);
            } else {
                toast.error(error.response?.data?.message || "Failed to add card.");
            }
        } finally {
            setIsSaving(false);
        }
    };
    
    // Resetuj stanje kada se modal zatvori
    const handleClose = () => {
        setCardNumber('');
        setExpiryDate('');
        setCvc('');
        setErrors({});
        onClose();
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Add a New Card</DialogTitle>
                 <DialogDescription>
                        Enter your card details. Your information is secure.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-1">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" value={cardNumber} onChange={e => setCardNumber(e.target.value)} maxLength={16} />
                        {errors.cardNumber && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/> {errors.cardNumber}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="expiryDate">Expiry Date (MM/YY)</Label>
                            <Input id="expiryDate" placeholder="MM/YY" value={expiryDate} onChange={handleExpiryChange} />
                            {errors.expiryDate && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/> {errors.expiryDate}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" value={cvc} onChange={e => setCvc(e.target.value)} maxLength={4} />
                            {errors.cvc && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/> {errors.cvc}</p>}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleAddCard} disabled={isSaving}>
                        {isSaving ? 'Adding...' : 'Add Card'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};