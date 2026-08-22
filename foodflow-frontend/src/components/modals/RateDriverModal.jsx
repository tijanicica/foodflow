// src/components/modals/RateDriverModal.jsx

import React, { useState } from 'react';
import { X, Star, ShieldCheck, Sparkles, MessageCircle, User } from 'lucide-react';

// === ULTIMATIVNA StarRating KOMPONENTA sa tekstualnim feedback-om ===
const StarRating = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const ratingLabels = ["Užasno", "Loše", "Dobro", "Vrlo Dobro", "Odlično!"];
    const ratingColors = ["text-red-500", "text-orange-500", "text-yellow-500", "text-lime-500", "text-green-500"];

    const currentLabel = ratingLabels[(hoverRating || rating) - 1] || "";
    const currentColor = ratingColors[(hoverRating || rating) - 1] || "text-gray-400";

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div 
                className="flex items-center"
                onMouseLeave={() => setHoverRating(0)}
            >
                {[1, 2, 3, 4, 5].map(starIndex => (
                    <Star
                        key={starIndex}
                        size={36}
                        className={`cursor-pointer transition-all duration-200 ${starIndex <= (hoverRating || rating) ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]' : 'text-gray-300'}`}
                        fill={starIndex <= (hoverRating || rating) ? 'currentColor' : 'none'}
                        onClick={() => setRating(starIndex)}
                        onMouseEnter={() => setHoverRating(starIndex)}
                    />
                ))}
            </div>
            <span className={`font-semibold text-sm min-w-[80px] text-center transition-colors duration-200 ${currentColor}`}>
                {currentLabel}
            </span>
        </div>
    );
};

// === Komponenta za jednu KARTICU ocenjivanja ===
const RatingCategoryCard = ({ icon, label, rating, setRating }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
            {icon}
            <p className="font-bold text-lg text-gray-800">{label}</p>
        </div>
        <StarRating rating={rating} setRating={setRating} />
    </div>
);

export function RateDriverModal({ delivery, onClose, onSubmit }) {
    const [professionalism, setProfessionalism] = useState(0);
    const [hygiene, setHygiene] = useState(0);
    const [communication, setCommunication] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        if (professionalism === 0 || hygiene === 0 || communication === 0) {
            toast.error("Molimo vas, ocenite sve tri kategorije.");
            return;
        }
        onSubmit({ professionalismRating: professionalism, hygieneRating: hygiene, communicationRating: communication, comment });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-modal-show">
            <div className="bg-pink-50/50 flex flex-col rounded-2xl shadow-2xl w-full max-w-xl max-h-[95vh] overflow-hidden">
                
                {/* === PRELEPI HEADER === */}
                <div className="flex-shrink-0 p-6 text-center bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-t-2xl relative">
                    <button type="button" onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors">
                        <X size={24} />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <User size={32} />
                    </div>
                    <h2 className="text-2xl font-bold">Ocenite vozača</h2>
                    <p className="text-lg font-medium opacity-90">{delivery.driverInfo.split(':')[1].trim()}</p>
                    <p className="text-xs opacity-70 mt-1">Porudžbina: {delivery.orderNumber}</p>
                </div>

                {/* === TELO FORME === */}
                <div className="p-8 space-y-5 overflow-y-auto">
                    <RatingCategoryCard 
                        icon={<ShieldCheck size={24} className="text-pink-600"/>}
                        label="Profesionalnost"
                        rating={professionalism}
                        setRating={setProfessionalism}
                    />
                     <RatingCategoryCard 
                        icon={<Sparkles size={24} className="text-pink-600"/>}
                        label="Higijena"
                        rating={hygiene}
                        setRating={setHygiene}
                    />
                     <RatingCategoryCard 
                        icon={<MessageCircle size={24} className="text-pink-600"/>}
                        label="Komunikacija"
                        rating={communication}
                        setRating={setCommunication}
                    />
                    
                    <div>
                         <textarea 
                            placeholder="Dodajte komentar... (opciono)" 
                            value={comment} 
                            onChange={e => setComment(e.target.value)} 
                            className="w-full p-4 h-24 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-colors duration-200 mt-2"
                        />
                    </div>
                </div>

                {/* === FOOTER SA DUGMADIMA === */}
                <div className="flex-shrink-0 p-6 flex justify-end gap-4 border-t border-gray-200/50 bg-white/50">
                    <button type="button" onClick={onClose} className="bg-gray-100 text-gray-800 font-bold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                        Kasnije
                    </button>
                    <button onClick={handleSubmit} className="bg-pink-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-pink-700 transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transform hover:-translate-y-0.5">
                        Pošalji Ocenu
                    </button>
                </div>
            </div>
        </div>
    );
}