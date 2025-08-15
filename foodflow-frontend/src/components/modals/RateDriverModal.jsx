
// Kreiraj src/components/modals/RateDriverModal.jsx
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

const StarRating = ({ rating, setRating }) => (
    <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
            <span key={star} onClick={() => setRating(star)} className="text-3xl cursor-pointer">
                {star <= rating ? '⭐' : '☆'}
            </span>
        ))}
    </div>
);

export function RateDriverModal({ delivery, onClose, onSubmit }) {
    const [professionalism, setProfessionalism] = useState(0);
    const [hygiene, setHygiene] = useState(0);
    const [communication, setCommunication] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        onSubmit({ 
            professionalismRating: professionalism, 
            hygieneRating: hygiene, 
            communicationRating: communication, 
            comment 
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold">Rate Driver: {delivery.driverInfo.split(':')[1].trim()}</h2>
                <p className="text-sm text-gray-500 mb-6">{delivery.orderNumber}</p>
                <div className="space-y-4">
                    <div><p>Professionalism at pickup</p><StarRating rating={professionalism} setRating={setProfessionalism} /></div>
                    <div><p>Hygiene</p><StarRating rating={hygiene} setRating={setHygiene} /></div>
                    <div><p>Communication</p><StarRating rating={communication} setRating={setCommunication} /></div>
                    <Textarea placeholder="Additional Comments (Optional)" value={comment} onChange={e => setComment(e.target.value)} />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit Rating</Button>
                </div>
            </div>
        </div>
    );
}

