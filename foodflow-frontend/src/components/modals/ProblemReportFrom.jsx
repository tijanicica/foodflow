// src/components/modals/ProblemReportForm.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getProblemCategories, createSupportTicket } from '@/services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Komponenta za jedan klikabilni link problema
const ProblemLink = ({ category, onClick, isSelected }) => (
    <button
        onClick={() => onClick(category.id)}
        className={`text-left text-brand-accent hover:underline focus:outline-none focus:ring-2 focus:ring-brand-accent/50 rounded px-1 py-0.5 ${isSelected ? 'font-bold bg-brand-accent/20' : ''}`}
    >
        {category.name}
    </button>
);

export const ProblemReportForm = ({ isOpen, onClose, orderId }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Učitavanje kategorija sa servera
    useEffect(() => {
        if (isOpen) {
            const fetchCategories = async () => {
                try {
                    const allCategories = await getProblemCategories();
                    setCategories(allCategories);
                } catch {
                    toast.error("Could not load problem categories.");
                }
            };
            fetchCategories();
        }
    }, [isOpen]);

    // Grupisanje kategorija (logika koja pravi strukturu sa slike)
    const groupedCategories = useMemo(() => {
        if (categories.length === 0) return [];
        
        const parentCategories = categories.filter(c => c.parentCategoryId === null && c.name !== 'Other');
        
        return parentCategories.map(parent => ({
            ...parent,
            subCategories: categories.filter(sub => sub.parentCategoryId === parent.id)
        }));
    }, [categories]);

    const handleSelectCategory = (categoryId) => {
        // Ako korisnik ponovo klikne na istu kategoriju, deselektuj je
        setSelectedCategoryId(prev => (prev === categoryId ? null : categoryId));
    };

    const handleSubmit = async () => {
        // Ako je izabrana predefinisana kategorija, šaljemo njen ID.
        // Ako nije, a ima teksta u "Other", onda se oslanjamo na NLP (preselectedCategoryId je null).
        const isOtherSelected = selectedCategoryId === null && description.trim() !== '';
        
        if (selectedCategoryId === null && !isOtherSelected) {
            toast.error("Please select a problem or describe it in the 'Other' field.");
            return;
        }

        setIsLoading(true);
        try {
            const ticketData = {
                orderId,
                preselectedCategoryId: isOtherSelected ? null : selectedCategoryId,
                description,
            };
            const newTicket = await createSupportTicket(ticketData);
            toast.success("Support ticket created! An operator will be with you shortly.");
            handleClose();
            navigate(`/support/chat/${newTicket.id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create ticket.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedCategoryId(null);
        setDescription('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-[#FFFBF5] border-brand-background sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-brand-primary">Report a Problem</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-6 text-brand-primary">
                    {groupedCategories.map(parent => (
                        <div key={parent.id}>
                            <h3 className="font-bold italic text-lg mb-2">{parent.name}:</h3>
                            <div className="flex flex-col items-start gap-1 pl-4">
                                {parent.subCategories.map(sub => (
                                    <ProblemLink 
                                        key={sub.id} 
                                        category={sub} 
                                        onClick={handleSelectCategory} 
                                        isSelected={selectedCategoryId === sub.id}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {/* Other Section */}
                    <div>
                         <h3 className="font-bold italic text-lg mb-2">Other:</h3>
                         <Textarea
                             placeholder="Describe your problem here..."
                             value={description}
                             onChange={(e) => {
                                 setDescription(e.target.value);
                                 // Ako korisnik počne da kuca, automatski deselektuj predefinisani problem
                                 if (selectedCategoryId !== null) {
                                     setSelectedCategoryId(null);
                                 }
                             }}
                             className="bg-white border-brand-background focus:ring-brand-accent"
                         />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={handleClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="bg-brand-primary hover:bg-brand-primary/90">
                        {isLoading ? 'Creating...' : 'Submit and Start Chat'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};