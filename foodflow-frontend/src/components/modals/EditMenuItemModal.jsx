import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

export function EditMenuItemModal({ isOpen, onClose, onSubmit, item, allergens, dietTypes }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [type, setType] = useState('MAIN_COURSE');
    const [selectedDietTypes, setSelectedDietTypes] = useState(new Set());
    const [selectedAllergens, setSelectedAllergens] = useState(new Set());
    const [availableAllDay, setAvailableAllDay] = useState(true);
    const [timeFrom, setTimeFrom] = useState('');
    const [timeTo, setTimeTo] = useState('');

    // Popunjava formu sa podacima kada se 'item' promeni
    useEffect(() => {
        if (item) {
            setName(item.name || '');
            setDescription(item.description || '');
            setPrice(item.price?.toString() || '');
            setImageUrl(item.imageUrl || '');
            setType(item.type || 'MAIN_COURSE');
            setSelectedDietTypes(new Set(item.dietTypes?.map(dt => dt.id) || []));
            setSelectedAllergens(new Set(item.allergens?.map(al => al.id) || []));
            setAvailableAllDay(!item.timeFrom && !item.timeTo);
            setTimeFrom(item.timeFrom || '');
            setTimeTo(item.timeTo || '');
        }
    }, [item]);

    if (!isOpen) return null;

    const handleCheckboxChange = (id, state, setState) => {
        const newSet = new Set(state);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setState(newSet);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Prosleđujemo ID stavke i sve podatke iz forme
        onSubmit(item.id, {
            name, description,
            price: parseFloat(price),
            imageUrl, type,
            dietTypeIds: Array.from(selectedDietTypes),
            allergenIds: Array.from(selectedAllergens),
            availableAllDay,
            timeFrom: availableAllDay ? null : timeFrom,
            timeTo: availableAllDay ? null : timeTo
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-brand-background-light p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-brand-primary mb-6 text-center">Edit Menu Item</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input placeholder="Item Name" value={name} onChange={e => setName(e.target.value)} required />
                    <Textarea placeholder="Description (max 500 chars)" value={description} onChange={e => setDescription(e.target.value)} maxLength="500" />
                    <Input type="number" placeholder="Price (RSD)" value={price} onChange={e => setPrice(e.target.value)} required step="0.01" />
                    <Input placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                    <div>
                        <Label>Item Type</Label>
                        <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 border rounded bg-white mt-1">
                            <option value="MAIN_COURSE">Main Course</option>
                            <option value="DESSERT">Dessert</option>
                            <option value="DRINK">Drink</option>
                        </select>
                    </div>
                    <div>
                        <Label>Dietary Type</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                            {dietTypes.map(dt => (
                                <label key={dt.id} className="flex items-center gap-2">
                                    <input type="checkbox" checked={selectedDietTypes.has(dt.id)} onChange={() => handleCheckboxChange(dt.id, selectedDietTypes, setSelectedDietTypes)} />
                                    {dt.name}
                                </label>
                            ))}
                        </div>
                    </div>
                     <div>
                        <Label>Contains Allergens</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                            {allergens.map(al => (
                                <label key={al.id} className="flex items-center gap-2">
                                    <input type="checkbox" checked={selectedAllergens.has(al.id)} onChange={() => handleCheckboxChange(al.id, selectedAllergens, setSelectedAllergens)} />
                                    {al.name}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label>Availability</Label>
                        <div className="flex items-center gap-2 my-2">
                            <input type="checkbox" id="allDayEdit" checked={availableAllDay} onChange={() => setAvailableAllDay(!availableAllDay)} />
                            <label htmlFor="allDayEdit">Available all day</label>
                        </div>
                        {!availableAllDay && (
                            <div className="grid grid-cols-2 gap-4">
                                <Input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} required={!availableAllDay} />
                                <Input type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)} required={!availableAllDay} />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="w-full">Cancel</Button>
                        <Button type="submit" className="w-full">Save Changes</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}