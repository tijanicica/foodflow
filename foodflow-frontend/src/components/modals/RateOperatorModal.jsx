// src/components/modals/RateOperatorModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import { rateSupportTicket } from "@/services/api"; // Nova API funkcija

const StarRating = ({ rating, setRating }) => (
  <div className="flex items-center justify-center space-x-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-10 w-10 cursor-pointer transition-all ${
          rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
        onClick={() => setRating(star)}
      />
    ))}
  </div>
);

export const RateOperatorModal = ({ isOpen, onClose, ticketId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    setIsLoading(true);
    try {
      await rateSupportTicket(ticketId, { rating, comment });
      toast.success("Thank you for your feedback!");
      onClose();
    } catch (error) {
      toast.error("Failed to submit rating.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate Your Support Experience</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <StarRating rating={rating} setRating={setRating} />
          <Textarea
            placeholder="Leave an optional comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
