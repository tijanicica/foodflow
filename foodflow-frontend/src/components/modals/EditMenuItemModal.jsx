import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Sprout, Clock, CheckCircle, Package, Utensils } from 'lucide-react';

//================================================================================
// POMOĆNE KOMPONENTE
//================================================================================

const CheckboxCard = ({ label, isChecked, onToggle }) => (
    <div
        onClick={onToggle}
        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center justify-between text-sm font-medium
            ${isChecked 
                ? 'bg-pink-50 border-pink-500 text-pink-800 shadow-sm' 
                : 'bg-white hover:border-pink-400/50 hover:bg-pink-50/20 border-gray-200 text-gray-700'
            }`}
    >
        <span>{label}</span>
        {isChecked && <CheckCircle size={18} className="text-pink-500" />}
    </div>
);

const SectionTitle = ({ icon, title }) => (
    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-3 border-b pb-3 mb-6">
        {React.cloneElement(icon, { className: "text-pink-500" })}
        {title}
    </h3>
);


//================================================================================
// GLAVNA MODAL KOMPONENTA
//================================================================================

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

    useEffect(() => {
        if (item) {
            setName(item.name || '');
            setDescription(item.description || '');
            setPrice(item.price?.toString() || '');
            setImageUrl(item.imageUrl || '');
            setType(item.type || 'MAIN_COURSE');
            setSelectedDietTypes(new Set(item.dietTypes?.map(dt => dt.id) || []));
            setSelectedAllergens(new Set(item.allergens?.map(al => al.id) || []));
            setAvailableAllDay(item.timeFrom === null && item.timeTo === null);
            setTimeFrom(item.timeFrom || '');
            setTimeTo(item.timeTo || '');
        }
    }, [item]);

    const handleCheckboxChange = (id, state, setState) => {
        const newSet = new Set(state);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setState(newSet);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
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
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh]"
                    >
                        {/* ZAGLAVLJE */}
                        <header className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-3xl font-bold text-gray-800">Izmena Artikla</h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200">
                                <X size={24} />
                            </Button>
                        </header>

                        {/* FORMA U 2 KOLONE */}
                        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                {/* Levi deo forme */}
                                <div className="p-8 space-y-6 lg:border-r">
                                    <SectionTitle icon={<Info size={22} />} title="Osnovne Informacije" />
                                    
                                    <div>
                                        <Label htmlFor="name" className="font-semibold text-gray-600">Naziv Artikla</Label>
                                        <Input id="name" placeholder="Npr. Carbonara" value={name} onChange={e => setName(e.target.value)} required className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="description" className="font-semibold text-gray-600">Opis</Label>
                                        <Textarea id="description" placeholder="Kratak, primamljiv opis jela..." value={description} onChange={e => setDescription(e.target.value)} maxLength="500" className="mt-1 min-h-[100px]" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                         <div>
                                            <Label htmlFor="price" className="font-semibold text-gray-600">Cena (RSD)</Label>
                                            <Input id="price" type="number" placeholder="850" value={price} onChange={e => setPrice(e.target.value)} required step="0.01" className="mt-1" />
                                        </div>
                                        <div>
                                            <Label className="font-semibold text-gray-600">Tip Artikla</Label>
                                            <Select value={type} onValueChange={setType}>
                                                <SelectTrigger className="mt-1"><SelectValue placeholder="Izaberite tip..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MAIN_COURSE">Glavno Jelo</SelectItem>
                                                    <SelectItem value="DESSERT">Dezert</SelectItem>
                                                    <SelectItem value="DRINK">Piće</SelectItem>
                                                    <SelectItem value="SIDE_DISH">Prilog</SelectItem>
                                                    <SelectItem value="SOUP">Supa</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                     <div>
                                        <Label htmlFor="imageUrl" className="font-semibold text-gray-600">URL Slike</Label>
                                        <Input id="imageUrl" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="mt-1"/>
                                    </div>
                                </div>
                                
                                {/* Desni deo forme */}
                                <div className="p-8 space-y-6">
                                     <SectionTitle icon={<Sprout size={22} />} title="Detalji o Ishrani" />
                                    <div>
                                        <Label className="font-semibold text-gray-600 mb-2 block">Tipovi Ishrane</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {dietTypes.map(dt => (
                                                <CheckboxCard key={dt.id} label={dt.name} isChecked={selectedDietTypes.has(dt.id)} onToggle={() => handleCheckboxChange(dt.id, selectedDietTypes, setSelectedDietTypes)} />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="font-semibold text-gray-600 mb-2 block">Sadrži Alergene</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {allergens.map(al => (
                                                <CheckboxCard key={al.id} label={al.name} isChecked={selectedAllergens.has(al.id)} onToggle={() => handleCheckboxChange(al.id, selectedAllergens, setSelectedAllergens)} />
                                            ))}
                                        </div>
                                    </div>
                                    
                                     <SectionTitle icon={<Clock size={22} />} title="Dostupnost" />
                                     <div className="flex items-center gap-3 bg-white p-4 rounded-lg border">
                                        <input type="checkbox" id="allDayEdit" checked={availableAllDay} onChange={() => setAvailableAllDay(!availableAllDay)} className="h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                                        <label htmlFor="allDayEdit" className="font-medium text-gray-800">Dostupno tokom celog dana</label>
                                    </div>
                                    {!availableAllDay && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="timeFrom">Od</Label>
                                                <Input id="timeFrom" type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} required={!availableAllDay} />
                                            </div>
                                            <div>
                                                <Label htmlFor="timeTo">Do</Label>
                                                <Input id="timeTo" type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)} required={!availableAllDay} />
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </form>
                        
                        {/* PODNOŽJE */}
                        <footer className="flex justify-end gap-4 p-6 border-t bg-white/50 backdrop-blur-sm sticky bottom-0">
                            <Button type="button" variant="ghost" onClick={onClose} className="w-1/4 text-gray-700 hover:bg-gray-200">Otkaži</Button>
                            <Button type="submit" onClick={handleSubmit} className="w-1/3 text-white font-bold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30">Sačuvaj Izmene</Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}