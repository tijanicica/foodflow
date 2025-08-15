// src/components/modals/EditMenuModal.jsx

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function EditMenuModal({ isOpen, onClose, onSubmit, menu }) {
    const [menuName, setMenuName] = useState('');

    useEffect(() => {
        if (menu) {
            setMenuName(menu.name);
        }
    }, [menu]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ menuName });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-brand-background-light p-8 rounded-lg shadow-xl w-full max-w-md m-4">
                <h2 className="text-2xl font-bold text-brand-primary mb-6 text-center">Edit Menu Name</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="menuName" className="text-sm font-medium text-gray-700">Menu Name</Label>
                        <Input
                            id="menuName"
                            type="text"
                            value={menuName}
                            onChange={(e) => setMenuName(e.target.value)}
                            required
                            className="bg-white"
                        />
                    </div>
                    <div className="flex justify-center gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="w-full">
                            Cancel
                        </Button>
                        <Button type="submit" className="w-full">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}