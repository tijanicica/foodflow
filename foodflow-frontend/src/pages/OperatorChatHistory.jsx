// src/pages/OperatorChatHistoryPage.jsx
import React, { useState, useEffect } from "react";
import { OperatorNavbar } from "@/components/OperatorNavbar";
import { Footer } from "@/components/Footer";
import { getTicketHistory } from "@/services/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { History, MessageSquare, ListChecks } from "lucide-react";

// Komponenta za prikaz jednog tiketa u listi
const HistoryTicketCard = ({ ticket }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
      <div>
        <p className="font-bold">
          Ticket #{ticket.id} - {ticket.customerName}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {ticket.problemCategoryName}
        </p>
      </div>
      <Button asChild variant="outline">
        <Link to={`/operator/chat/${ticket.id}`}>
          <MessageSquare className="mr-2 h-4 w-4" />
          View Chat
        </Link>
      </Button>
    </div>
  );
};

export const OperatorChatHistoryPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getTicketHistory();
        setTickets(data);
      } catch (error) {
        console.error("Failed to fetch chat history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
      <OperatorNavbar />
      <main className="container mx-auto px-4 py-12 flex-grow">
        <h2 className="text-3xl font-bold mb-6 flex items-center">
          <History className="mr-3" />
          My Chat History (Last 30 Days)
        </h2>

        {loading ? (
          <p>Loading history...</p>
        ) : tickets.length > 0 ? (
          <div className="space-y-4 max-w-4xl">
            {tickets.map((ticket) => (
              <HistoryTicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : (
          <p>No closed chats in the last 30 days.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};
