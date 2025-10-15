// src/pages/OperatorHistoryPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SupportAdminNavbar } from "@/components/SupportAdminNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getOperatorTicketHistory } from "@/services/api";
import toast from "react-hot-toast";
import {
  History,
  Calendar,
  RefreshCw,
  ArrowLeft,
  MessageSquare,
  User,
  Tag,
  Clock,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

const TicketCard = ({ ticket, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-brand-primary" />
          <span className="font-semibold text-lg">Ticket #{ticket.id}</span>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {ticket.status}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Tag size={16} />
          <span className="font-medium">Category:</span>
          <span>{ticket.problemCategoryName}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <User size={16} />
          <span className="font-medium">Customer:</span>
          <span>{ticket.customerName}</span>
        </div>
      </div>
    </motion.div>
  );
};

export const OperatorHistoryPage = () => {
  const { operatorId } = useParams();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [operatorName, setOperatorName] = useState("");

  const fetchHistory = async (start = null, end = null) => {
    setLoading(true);
    try {
      const formattedStartDate = start ? new Date(start).toISOString() : null;
      const formattedEndDate = end
        ? new Date(end + "T23:59:59").toISOString()
        : null;

      const data = await getOperatorTicketHistory(
        operatorId,
        formattedStartDate,
        formattedEndDate
      );

      setTickets(data);
      setOperatorName(data.operatorName || `Operator #${operatorId}`); // Postavljamo ime operatera
    } catch (error) {
      toast.error("Failed to load ticket history.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [operatorId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchHistory(startDate, endDate);
  };

  const handleClearDates = () => {
    setStartDate("");
    setEndDate("");
    setIsRefreshing(true);
    fetchHistory(null, null);
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/support/chat-history/${ticketId}`);
  };

  return (
    <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
      <SupportAdminNavbar />

      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <History className="text-brand-primary" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Operator Ticket History
                </h1>
              </div>
            </div>
          </div>

          {/* Date Filter Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-brand-primary" />
              <h2 className="text-lg font-semibold">Filter by Date Range</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex-1 bg-brand-primary hover:bg-brand-primary/90"
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Apply Filter
                    </>
                  )}
                </Button>

                {(startDate || endDate) && (
                  <Button
                    onClick={handleClearDates}
                    variant="outline"
                    className="px-3"
                    title="Clear dates"
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>
            </div>

            {(startDate || endDate) && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                Showing tickets from{" "}
                <span className="font-semibold">
                  {startDate || "beginning"}
                </span>{" "}
                to <span className="font-semibold">{endDate || "now"}</span>
              </div>
            )}
          </div>

          {/* Tickets List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Closed Tickets ({tickets.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="animate-spin h-8 w-8 text-brand-primary" />
                <span className="ml-3 text-gray-600">Loading tickets...</span>
              </div>
            ) : tickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => handleTicketClick(ticket.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed">
                <History className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-xl font-semibold text-gray-800">
                  No Tickets Found
                </h3>
                <p className="mt-2 text-gray-500">
                  {startDate || endDate
                    ? "No closed tickets found in the selected date range."
                    : "This operator has no closed tickets yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
