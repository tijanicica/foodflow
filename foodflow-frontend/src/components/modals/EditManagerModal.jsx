import React, { useState, useEffect } from 'react';
import { getManagerDetails, getRestaurantOptions } from '@/services/api';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Select from 'react-select'; // Koristićemo bolji 'select' za više opcija
export function EditManagerModal({ isOpen, onClose, onSubmit, managerId }) {
const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '' });
const [restaurantOptions, setRestaurantOptions] = useState([]);
const [selectedRestaurants, setSelectedRestaurants] = useState([]);
// Učitaj sve restorane i podatke o menadžeru kada se modal otvori
    useEffect(() => {
        if (isOpen && managerId) {
            const fetchData = async () => {
                const [managerData, restaurantsData] = await Promise.all([
                    getManagerDetails(managerId),
                    getRestaurantOptions()
                ]);
                 // ===== DODAJ OVAJ CONSOLE.LOG =====
                    console.log("Restaurants received from API:", restaurantsData);
                    // ===================================

                setFormData(managerData);
                setRestaurantOptions(restaurantsData.map(r => ({ value: r.id, label: r.name })));
                setSelectedRestaurants(
                    restaurantsData
                        .filter(r => managerData.managedRestaurantIds.includes(r.id))
                        .map(r => ({ value: r.id, label: r.name }))
                );
            };
            fetchData();
        }
    }, [isOpen, managerId]);

    if (!isOpen) return null;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleRestaurantChange = (selectedOptions) => setSelectedRestaurants(selectedOptions);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            restaurantIds: selectedRestaurants.map(r => r.value)
        };
        onSubmit(managerId, payload);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">Edit Manager</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... (polja za ime, prezime, email, telefon) ... */}
                    <div>
                        <Label>Managed Restaurants</Label>
                        <Select
                            isMulti
                            options={restaurantOptions}
                            value={selectedRestaurants}
                            onChange={handleRestaurantChange}
                            className="mt-1"
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}