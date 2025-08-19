import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Star, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitCombinedRating } from '@/services/api'; 

const StarRating = ({ label, rating, setRating }) => (
    <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-700 text-sm sm:text-base">{label}</p>
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-7 w-7 sm:h-8 sm:w-8 cursor-pointer transition-all duration-150 transform hover:scale-110 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    onClick={() => setRating(star === rating ? 0 : star)}
                />
            ))}
        </div>
    </div>
);

export const RateOrderModal = ({ isOpen, onClose, order, onRatingSuccess }) => {
    const [ratings, setRatings] = useState({ onTimeArrival: 1, hygiene: 1, kindness: 1, quality: 1, taste: 1, portion: 1 });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { 
        console.log("[MODAL STATE] Modal is now:", isOpen ? "Open" : "Closed");
        if (isOpen) {
            console.log("[MODAL STATE] Resetting ratings for new session.");
            setRatings({ onTimeArrival: 1, hygiene: 1, kindness: 1, quality: 1, taste: 1, portion: 1 });
        }
    }, [isOpen]);

    const handleRatingChange = (field, value) => {
        console.log(`[RATING CHANGE] Field: ${field}, New Value: ${value}`);
        setRatings(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        console.log("%c[SUBMIT] Submit process started...", "color: blue; font-weight: bold;");

        if (!order || !order.id) {
            toast.error("Error: Order information is missing.");
            console.error("[SUBMIT VALIDATION FAILED] 'order' or 'order.id' is missing. Current order prop:", order);
            return;
        }

        setIsLoading(true);

        const payload = {
            onTimeArrivalRating: ratings.onTimeArrival || null,
            hygieneRating: ratings.hygiene || null,
            kindnessRating: ratings.kindness || null,
            quality: ratings.quality || null,
            taste: ratings.taste || null,
            portionSize: ratings.portion || null,
        };

        const hasAnyRating = Object.values(payload).some(v => v !== null);

        if (!hasAnyRating) {
            toast.error("Please provide at least one rating.");
            setIsLoading(false);
            console.warn("[SUBMIT VALIDATION FAILED] No ratings were provided.");
            return;
        }

        console.log(`[API CALL] Attempting to submit rating for order ID: ${order.id}`);
        console.log("[API PAYLOAD]", payload);

        try {
            await submitCombinedRating(order.id, payload);
            
            console.log("%c[API SUCCESS] Rating submitted successfully!", "color: green; font-weight: bold;");
            toast.success('Thank you for your feedback!');
            onRatingSuccess(order.id);
            onClose();

        } catch (error) {
            // === GARANTOVANI ISPIS GREŠKE U KONZOLU ===
            console.error("%c[API ERROR] The request failed!", "color: red; font-weight: bold; font-size: 14px;");
            console.error(" - Order ID:", order.id);
            console.error(" - Payload Sent:", payload);
            
            if (error.response) {
                // Greška koju je vratio server (4xx, 5xx)
                console.error(" - Status Code:", error.response.status);
                console.error(" - Server Response Data:", error.response.data);
            } else if (error.request) {
                // Greška u mreži ili CORS
                console.error(" - No response from server. Check network connection or CORS configuration on the backend.");
            } else {
                // Greška u samom frontend kodu pre slanja
                console.error(" - Error setting up the request:", error.message);
            }
            // Ispisujemo ceo objekat greške za sve detalje
            console.error(" - Full Error Object:", error);
            // ===============================================
            
            toast.error(error.response?.data?.message || 'Failed to submit ratings. Check console for details.');

        } finally {
            setIsLoading(false);
        }
    };

    if (!order) {
        // Logujemo ako se modal renderuje bez order objekta
        if (isOpen) console.warn("[MODAL RENDER] Attempted to render modal, but 'order' prop is null or undefined.");
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#FAF6EB] border-[#EAE1D1] sm:max-w-lg">
                <DialogHeader className="text-left">
                    <DialogTitle className="text-xl font-bold text-[#4A4A4A]">Rate Your Experience</DialogTitle>
                    <p className="text-sm text-gray-500">Order #{order.id} from {order.restaurantName}</p>
                </DialogHeader>

                <div className="py-2">
                    <p className="text-lg font-bold text-brand-primary mb-3">Rate the Delivery</p>
                    <StarRating label="On-Time Arrival:" rating={ratings.onTimeArrival} setRating={(val) => handleRatingChange('onTimeArrival', val)} />
                    <StarRating label="Driver's Hygiene:" rating={ratings.hygiene} setRating={(val) => handleRatingChange('hygiene', val)} />
                    <StarRating label="Kindness:" rating={ratings.kindness} setRating={(val) => handleRatingChange('kindness', val)} />

                    <hr className="my-5 border-dashed border-[#EAE1D1]" />

                    <p className="text-lg font-bold text-brand-primary mb-3">Rate the Order</p>
                    <StarRating label="Food Quality:" rating={ratings.quality} setRating={(val) => handleRatingChange('quality', val)} />
                    <StarRating label="Taste:" rating={ratings.taste} setRating={(val) => handleRatingChange('taste', val)} />
                    <StarRating label="Portion Size:" rating={ratings.portion} setRating={(val) => handleRatingChange('portion', val)} />
                </div>

                <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto">
                        <AlertTriangle className="mr-2 h-4 w-4" /> Save and Report a Problem
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto bg-[#4A4A4A] hover:bg-[#333]">
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};