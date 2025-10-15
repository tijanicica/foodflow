// src/pages/OperatorDashboardPage.jsx
import React, { useState, useEffect } from "react";
import { OperatorNavbar } from "@/components/OperatorNavbar";
import { Footer } from "@/components/Footer";
import { getOperatorDashboard } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, PlayCircle, MessageCircleDashed } from "lucide-react";
import { CircleAlert } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";

const TicketCard = ({ ticket }) => {
  console.log("Podaci za tiket:", ticket);
  const isNewTicket = ticket.status === "OPEN";
  const isActiveChat = ticket.status === "IN_PROGRESS";
  const getPriorityColor = (score) => {
    if (score > 8) return "text-red-700";
    if (score > 4) return "text-orange-500";
    return "text-green-500";
  };
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center gap-4 min-h-[80px]">
      {/* 1. DEO: Informacije o tiketu (zauzima sav preostali prostor) */}
      <div className="flex-grow">
        <p className="font-bold">
          Ticket #{ticket.id} - {ticket.customerName}
        </p>
        <p className="text-sm text-gray-500">{ticket.problemCategoryName}</p>
      </div>

      {/* 2. DEO: Prioritet i Tajmer (fiksna širina) */}
      <div className="flex items-center gap-6 flex-shrink-0">
        <div
          className={`flex items-center gap-2 font-semibold text-sm ${getPriorityColor(
            ticket.priorityScore
          )}`}
          title={`Priority Score: ${ticket.priorityScore}`}
        >
          <CircleAlert size={18} />
        </div>

        {/* Uslovno renderovanje tajmera SAMO za nove tikete */}
        {/* Ovo je ključni deo koji ispravno prikazuje tajmer */}
        {isNewTicket && ticket.assignedAt && (
          <CountdownTimer assignedAt={ticket.assignedAt} />
        )}
      </div>

      {/* 3. DEO: Dugme (fiksna širina) */}
      <div className="flex-shrink-0">
        <Button asChild>
          <Link to={`/operator/chat/${ticket.id}`}>
            {isActiveChat ? (
              <MessageSquare className="mr-2 h-4 w-4" />
            ) : (
              <PlayCircle className="mr-2 h-4 w-4" />
            )}
            {isActiveChat ? "Continue Chat" : "Start Chat"}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export const OperatorDashboardPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getOperatorDashboard();
        setTickets(data);
      } catch (error) {
        // ...
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const openTickets = tickets.filter((t) => t.status === "OPEN");
  const activeChats = tickets.filter((t) => t.status === "IN_PROGRESS");

  return (
    <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
      <OperatorNavbar />
      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sekcija za aktivne chatove */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <MessageSquare className="mr-3" /> Active Conversations
            </h2>
            <div className="space-y-3">
              {activeChats.length > 0 ? (
                activeChats.map((t) => <TicketCard key={t.id} ticket={t} />)
              ) : (
                <p>No active conversations.</p>
              )}
            </div>
          </div>
          {/* Sekcija za nove tikete */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <MessageCircleDashed className="mr-3" /> New Tickets
            </h2>
            <div className="space-y-3">
              {openTickets.length > 0 ? (
                openTickets.map((t) => <TicketCard key={t.id} ticket={t} />)
              ) : (
                <p>No new tickets assigned.</p>
              )}
            </div>
          </div>
        </div>
        {/* Legenda */}
        <div className="mt-10 p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Priority Legend</h3>
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-red-700">
              <CircleAlert size={18} />
              <span>Highest priority</span>
            </div>
            <div className="flex items-center gap-2 text-orange-500">
              <CircleAlert size={18} />
              <span>Medium priority</span>
            </div>
            <div className="flex items-center gap-2 text-green-500">
              <CircleAlert size={18} />
              <span>Lowest priority</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
