// src/components/modals/OperatorHistoryModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getOperatorTicketHistory } from "@/services/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export const OperatorHistoryModal = ({ isOpen, onClose, operator }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && operator) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const data = await getOperatorTicketHistory(operator.id);
          setTickets(data);
        } catch (error) {
          console.error("Failed to fetch operator history", error);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, operator]);

  if (!operator) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Chat History for {operator.firstName} {operator.lastName}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-4">
          {loading ? (
            <p>Loading history...</p>
          ) : tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-gray-50 p-3 rounded-md flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">
                      Ticket #{ticket.id} - {ticket.customerName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ticket.problemCategoryName}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="ghost">
                    <Link
                      to={`/support/chat-history/${ticket.id}`}
                      target="_blank"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" /> View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No chat history found for this operator.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
