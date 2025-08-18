// src/components/modals/CreateMenuModal.jsx

import React, { useState } from 'react';
import { X, BookOpen, Calendar } from 'lucide-react';

// Komponenta za Input sa ikonicom (može se izdvojiti u poseban fajl ako se često koristi)
const InputWithIcon = ({ icon, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            {icon}
        </div>
        <input {...props} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-colors duration-200" />
    </div>
);

export function CreateMenuModal({ isOpen, onClose, onSubmit }) {
    const [menuName, setMenuName] = useState('');
    const [activationDate, setActivationDate] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Resetujemo state nakon submita za sledeće otvaranje
        onSubmit({ menuName, activationDate: activationDate || null });
        setMenuName('');
        setActivationDate('');
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-modal-show">
            <form onSubmit={handleSubmit} className="bg-white flex flex-col rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                
                {/* === HEADER SA GRADIENTOM === */}
                <div className="flex-shrink-0 p-6 flex justify-between items-center bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold">Create New Menu</h2>
                        <p className="text-sm opacity-80">Započnite nešto ukusno.</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* === TELO FORME === */}
                <div className="p-8 space-y-6">
                    <div>
                        <label htmlFor="menuName" className="font-semibold text-gray-600 mb-2 block">Naziv Menija</label>
                        <InputWithIcon 
                            id="menuName"
                            icon={<BookOpen size={18} />} 
                            placeholder='npr. "Letnji Specijaliteti"'
                            value={menuName}
                            onChange={(e) => setMenuName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="activationDate" className="font-semibold text-gray-600 mb-2 block">Datum Aktivacije (Opciono)</label>
                         <InputWithIcon 
                            id="activationDate"
                            icon={<Calendar size={18} />} 
                            type="date"
                            value={activationDate}
                            onChange={(e) => setActivationDate(e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-2">Ako ostavite prazno, meni neće biti automatski aktiviran.</p>
                    </div>
                </div>

                {/* === FOOTER SA DUGMADIMA === */}
                <div className="flex-shrink-0 p-6 flex justify-end gap-4 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="bg-gray-100 text-gray-800 font-bold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                        Otkaži
                    </button>
                    <button type="submit" className="bg-pink-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-pink-700 transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transform hover:-translate-y-0.5">
                        Kreiraj Meni
                    </button>
                </div>
            </form>
        </div>
    );
}