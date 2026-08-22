// src/components/modals/AddMenuItemModal.jsx

import React, { useState } from 'react';
// ISPRAVLJENO: Uklonjena nepostojeća ikonica 'GlassOfMilk' i dodata 'AlertTriangle'
import { X, Check, Edit3, MessageSquare, DollarSign, Link2, Pizza, AlertTriangle, Sparkles, Clock } from 'lucide-react';

// === Još lepša Custom Checkbox komponenta ===
const CustomCheckbox = ({ id, label, isSelected, onChange }) => (
    <label
        htmlFor={id}
        className={`flex items-center text-sm font-medium px-4 py-2 rounded-full cursor-pointer transition-all duration-300 border-2
        ${isSelected
            ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/30'
            : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:text-pink-600'
        }`}
    >
        {isSelected && <Check size={16} className="mr-2" />}
        <input id={id} type="checkbox" className="sr-only" checked={isSelected} onChange={onChange} />
        {label}
    </label>
);

// === Komponenta za Input sa ikonicom ===
const InputWithIcon = ({ icon, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            {icon}
        </div>
        <input {...props} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-colors duration-200" />
    </div>
);

export function AddMenuItemModal({ isOpen, onClose, onSubmit, allergens, dietTypes }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [type, setType] = useState('MAIN_COURSE');
    const [selectedDietTypes, setSelectedDietTypes] = useState(new Set());
    const [selectedAllergens, setSelectedAllergens] = useState(new Set());
    const [availableAllDay, setAvailableAllDay] = useState(true);
    const [timeFrom, setTimeFrom] = useState('');
    const [timeTo, setTimeTo] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    if (!isOpen) return null;

    // Handler funkcije ostaju iste
    const handleCheckboxChange = (id, state, setState) => {
        const newSet = new Set(state);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setState(newSet);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, description, price: parseFloat(price), type, dietTypeIds: Array.from(selectedDietTypes), allergenIds: Array.from(selectedAllergens), availableAllDay, timeFrom: availableAllDay ? null : timeFrom, timeTo: availableAllDay ? null : timeTo, imageUrl });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-modal-show">
            <form onSubmit={handleSubmit} className="bg-white flex flex-col rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
                {/* === HEADER SA GRADIENTOM === */}
                <div className="flex-shrink-0 p-6 flex justify-between items-center bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold">Add New Menu Item</h2>
                        <p className="text-sm opacity-80">Popunite detalje za novu stavku u meniju</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* === TELO FORME SA SKROLOM I DVE KOLONE === */}
                <div className="flex-grow p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
                    {/* LEVA KOLONA */}
                    <div className="space-y-6">
                        <InputWithIcon icon={<Edit3 size={18} />} placeholder="Naziv stavke" value={name} onChange={e => setName(e.target.value)} required />
                        <div className="relative">
                            <div className="absolute top-3 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><MessageSquare size={18} /></div>
                            <textarea placeholder="Opis" value={description} onChange={e => setDescription(e.target.value)} maxLength="500" className="w-full pl-12 pr-4 py-3 h-32 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-colors duration-200" />
                        </div>
                        <InputWithIcon icon={<DollarSign size={18} />} type="number" placeholder="Cena (RSD)" value={price} onChange={e => setPrice(e.target.value)} required step="0.01" />
                        <InputWithIcon icon={<Link2 size={18} />} placeholder="URL Slike" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                    </div>

                    {/* DESNA KOLONA */}
                    <div className="space-y-6">
                        <div>
                            <label className="font-semibold text-gray-600 mb-2 block flex items-center gap-2"><Pizza size={18} className="text-pink-500"/>Tip jela</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-colors duration-200">
                                <option value="MAIN_COURSE">Glavno jelo</option> <option value="DESSERT">Dezert</option> <option value="DRINK">Piće</option>
                            </select>
                        </div>
                        <div>
                            <label className="font-semibold text-gray-600 mb-3 block flex items-center gap-2"><Sparkles size={18} className="text-pink-500"/>Tip ishrane</label>
                            <div className="flex flex-wrap gap-3">{dietTypes.map(dt => (<CustomCheckbox key={dt.id} id={`diet-${dt.id}`} label={dt.name} isSelected={selectedDietTypes.has(dt.id)} onChange={() => handleCheckboxChange(dt.id, selectedDietTypes, setSelectedDietTypes)} />))}</div>
                        </div>
                        <div>
                            {/* ISPRAVLJENO: Korišćena postojeća ikonica */}
                            <label className="font-semibold text-gray-600 mb-3 block flex items-center gap-2"><AlertTriangle size={18} className="text-pink-500"/>Sadrži alergene</label>
                            <div className="flex flex-wrap gap-3">{allergens.map(al => (<CustomCheckbox key={al.id} id={`allergen-${al.id}`} label={al.name} isSelected={selectedAllergens.has(al.id)} onChange={() => handleCheckboxChange(al.id, selectedAllergens, setSelectedAllergens)} />))}</div>
                        </div>
                        <div>
                            <label className="font-semibold text-gray-600 mb-3 block flex items-center gap-2"><Clock size={18} className="text-pink-500"/>Dostupnost</label>
                            <div className="bg-gray-50/70 p-4 rounded-lg">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="sr-only" checked={availableAllDay} onChange={() => setAvailableAllDay(!availableAllDay)} />
                                    <div className={`w-5 h-5 flex items-center justify-center rounded-md border-2 transition-all ${availableAllDay ? 'bg-pink-500 border-pink-500' : 'border-gray-300'}`}><Check size={14} className={`text-white transition-opacity ${availableAllDay ? 'opacity-100' : 'opacity-0'}`} /></div>
                                    <span>Dostupno ceo dan</span>
                                </label>
                                {!availableAllDay && (<div className="grid grid-cols-2 gap-4 mt-4 animate-fadeIn"><input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} required={!availableAllDay} className="w-full p-3 border border-gray-200 rounded-lg bg-white" /><input type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)} required={!availableAllDay} className="w-full p-3 border border-gray-200 rounded-lg bg-white" /></div>)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* === FOOTER SA DUGMADIMA === */}
                <div className="flex-shrink-0 p-6 flex justify-end gap-4 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="bg-gray-100 text-gray-800 font-bold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">Otkaži</button>
                    <button type="submit" className="bg-pink-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-pink-700 transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transform hover:-translate-y-0.5">Sačuvaj stavku</button>
                </div>
            </form>
        </div>
    );
}