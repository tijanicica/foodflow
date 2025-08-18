// src/components/modals/EditMenuModal.jsx

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

// Ikonice za prelep izgled
import { X, BookOpen, Edit } from 'lucide-react';

// Komponenta za Input sa ikonicom
const InputWithIcon = ({ icon, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            {icon}
        </div>
        <input {...props} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-colors duration-200" />
    </div>
);

export function EditMenuModal({ isOpen, onClose, onSubmit, menu }) {
    const [menuName, setMenuName] = useState('');

    useEffect(() => {
        // Postavi ime menija kada se modal otvori ili se promeni meni
        if (isOpen && menu) {
            setMenuName(menu.name);
        }
    }, [isOpen, menu]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ menuName });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-modal-show">
            <form onSubmit={handleSubmit} className="bg-white flex flex-col rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                
                {/* === HEADER SA GRADIENTOM === */}
                <div className="flex-shrink-0 p-6 flex justify-between items-center bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold">Edit Menu Name</h2>
                        <p className="text-sm opacity-80">Promenite naziv izabranog menija.</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* === TELO FORME === */}
                <div className="p-8">
                    <Label htmlFor="menuName" className="font-semibold text-gray-600 mb-2 block">Naziv Menija</Label>
                    <InputWithIcon 
                        id="menuName"
                        icon={<BookOpen size={18} />} 
                        type="text"
                        value={menuName}
                        onChange={(e) => setMenuName(e.target.value)}
                        required
                    />
                </div>

                {/* === FOOTER SA DUGMADIMA === */}
                <div className="flex-shrink-0 p-6 flex justify-end gap-4 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="bg-gray-100 text-gray-800 font-bold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                        Otkaži
                    </button>
                    <button type="submit" className="flex items-center gap-2 bg-pink-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-pink-700 transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transform hover:-translate-y-0.5">
                        <Edit size={16}/> Sačuvaj Izmene
                    </button>
                </div>
            </form>
        </div>
    );
}