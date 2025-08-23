// src/components/modals/RateOrderModal.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { submitCombinedRating } from "@/services/api";
import { ProblemReportForm } from "./ProblemReportFrom";

// Komponenta StarRating (sada će se koristiti)
const StarRating = ({ label, rating, setRating }) => (
  <div className="flex items-center justify-between mb-3">
    <p className="font-semibold text-gray-700 text-sm sm:text-base">{label}</p>
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-7 w-7 sm:h-8 sm:w-8 cursor-pointer transition-all duration-150 transform hover:scale-110 ${
            rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
          onClick={() => setRating(star === rating ? 0 : star)}
        />
      ))}
    </div>
  </div>
);

export const RateOrderModal = ({ isOpen, onClose, order, onRatingSuccess }) => {
  const [ratings, setRatings] = useState({
    onTimeArrival: 1,
    hygiene: 1,
    kindness: 1,
    quality: 1,
    taste: 1,
    portion: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isProblemFormOpen, setProblemFormOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRatings({
        onTimeArrival: 1,
        hygiene: 1,
        kindness: 1,
        quality: 1,
        taste: 1,
        portion: 1,
      });
      setProblemFormOpen(false);
    }
  }, [isOpen]);

  const handleRatingChange = (field, value) => {
    setRatings((prev) => ({ ...prev, [field]: value }));
  };

  const saveRatings = async () => {
    if (!order || !order.id) {
      toast.error("Error: Order information is missing.");
      return false;
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

    const hasAnyRating = Object.values(payload).some((v) => v !== null);
    if (!hasAnyRating) {
      setIsLoading(false);
      return true;
    }

    try {
      await submitCombinedRating(order.id, payload);
      toast.success("Your ratings have been saved!");
      onRatingSuccess(order.id);
      return true;
    } catch (error) {
      console.error("Failed to submit ratings:", error);
      toast.error(error.response?.data?.message || "Failed to submit ratings.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOnly = async () => {
    const success = await saveRatings();
    if (success) {
      onClose();
    }
  };

  const handleSaveAndReport = async () => {
    const success = await saveRatings();
    if (success) {
      setProblemFormOpen(true);
    }
  };

  if (!order) return null;

  return (
    <>
      <Dialog open={isOpen && !isProblemFormOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#FAF6EB] border-[#EAE1D1] sm:max-w-lg">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-bold text-[#4A4A4A]">
              Rate Your Experience
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Order #{order.id} from {order.restaurantName}
            </p>
          </DialogHeader>

          {/* ===== ISPRAVKA JE OVDE - POPUNJEN DIV ===== */}
          <div className="py-2">
            <p className="text-lg font-bold text-brand-primary mb-3">
              Rate the Delivery
            </p>
            <StarRating
              label="On-Time Arrival:"
              rating={ratings.onTimeArrival}
              setRating={(val) => handleRatingChange("onTimeArrival", val)}
            />
            <StarRating
              label="Driver's Hygiene:"
              rating={ratings.hygiene}
              setRating={(val) => handleRatingChange("hygiene", val)}
            />
            <StarRating
              label="Kindness:"
              rating={ratings.kindness}
              setRating={(val) => handleRatingChange("kindness", val)}
            />

            <hr className="my-5 border-dashed border-[#EAE1D1]" />

            <p className="text-lg font-bold text-brand-primary mb-3">
              Rate the Order
            </p>
            <StarRating
              label="Food Quality:"
              rating={ratings.quality}
              setRating={(val) => handleRatingChange("quality", val)}
            />
            <StarRating
              label="Taste:"
              rating={ratings.taste}
              setRating={(val) => handleRatingChange("taste", val)}
            />
            <StarRating
              label="Portion Size:"
              rating={ratings.portion}
              setRating={(val) => handleRatingChange("portion", val)}
            />
          </div>
          {/* ============================================== */}

          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAndReport}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <AlertTriangle className="mr-2 h-4 w-4" /> Save and Report a
              Problem
            </Button>
            <Button
              type="button"
              onClick={handleSaveOnly}
              disabled={isLoading}
              className="w-full sm:w-auto bg-[#4A4A4A] hover:bg-[#333]"
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {order && (
        <ProblemReportForm
          isOpen={isProblemFormOpen}
          onClose={() => {
            setProblemFormOpen(false);
            onClose();
          }}
          orderId={order.id}
        />
      )}
    </>
  );
};
