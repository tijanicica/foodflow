// src/components/modals/CreateMenuModal.jsx

import React, { useState } from 'react';
// ===== ISPRAVLJENE PUTANJE OVDE =====
// Idemo jedan nivo gore ('..') iz 'modals' foldera da bismo došli do 'components'
// Zatim ulazimo u 'ui' folder
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
// ===================================

export function CreateMenuModal({ isOpen, onClose, onSubmit }) {
    const [menuName, setMenuName] = useState('');
    const [activationDate, setActivationDate] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ menuName, activationDate: activationDate || null });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-brand-background-light p-8 rounded-lg shadow-xl w-full max-w-md m-4">
                <h2 className="text-2xl font-bold text-brand-primary mb-6 text-center">Create New Menu</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="menuName" className="text-sm font-medium text-gray-700">Menu Name</Label>
                        <Input
                            id="menuName"
                            type="text"
                            placeholder='e.g., "Winter Specials"'
                            value={menuName}
                            onChange={(e) => setMenuName(e.target.value)}
                            required
                            className="bg-white"
                        />
                    </div>
                    <div>
                        <Label htmlFor="activationDate" className="text-sm font-medium text-gray-700">Activation Date (Optional)</Label>
                        <Input
                            id="activationDate"
                            type="date"
                            value={activationDate}
                            onChange={(e) => setActivationDate(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                    <div className="flex justify-center gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="w-full">
                            Cancel
                        </Button>
                        <Button type="submit" className="w-full">
                            Create Menu
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}