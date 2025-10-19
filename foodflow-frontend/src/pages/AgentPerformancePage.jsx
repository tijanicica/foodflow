// src/pages/AgentPerformancePage.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { SupportAdminNavbar } from "@/components/SupportAdminNavbar";
import { Footer } from "@/components/Footer";
import { getOperatorRankings } from "@/services/api";
import toast from "react-hot-toast";
import { BarChart, Star, CheckSquare, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// -----------------------------------
// Pomoćne komponente
// -----------------------------------

const AdminSection = ({ title, icon, children }) => (
  <motion.div
    className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center gap-4 mb-6">
      <div className="bg-brand-background-light p-3 rounded-lg text-brand-primary">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    </div>
    <div>{children}</div>
  </motion.div>
);

const PerformanceRow = ({ rank, agent }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="grid grid-cols-12 gap-4 py-4 px-2 items-center text-base hover:bg-gray-50/80 rounded-lg transition-colors"
  >
    <div className="col-span-1 font-bold text-lg text-brand-primary text-center">
      {rank}.
    </div>
    <div className="col-span-4 font-medium text-brand-primary">
      {agent.firstName} {agent.lastName}
    </div>
    <div className="col-span-3 flex items-center gap-1.5 text-gray-600">
      <Star size={18} className="text-yellow-400 fill-yellow-400" />
      <span className="font-semibold">
        {agent.averageRating ? agent.averageRating.toFixed(2) : "N/A"}
      </span>
    </div>
    <div className="col-span-4 flex items-center gap-1.5 text-gray-600">
      <CheckSquare size={18} className="text-green-500" />
      <span className="font-semibold">
        {agent.resolvedTicketsCount} resolved tickets
      </span>
    </div>
  </motion.div>
);

const EmptyState = ({ isSearchActive }) => (
  <div className="text-center py-16 px-6 bg-gray-50 rounded-lg border-2 border-dashed">
    <BarChart className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-4 text-xl font-semibold text-gray-800">
      {isSearchActive ? "No Agents Match Your Search" : "No Performance Data"}
    </h3>
    <p className="mt-1 text-gray-500">
      {isSearchActive
        ? "Try searching for a different name."
        : "Performance data will appear once agents start resolving and getting rated on tickets."}
    </p>
  </div>
);

const PerformanceRowSkeleton = () => (
  <div className="grid grid-cols-12 gap-4 py-4 px-2 items-center animate-pulse">
    <div className="col-span-1 h-5 bg-gray-200 rounded w-1/2 mx-auto"></div>
    <div className="col-span-4 h-5 bg-gray-200 rounded w-3/4"></div>
    <div className="col-span-3 h-5 bg-gray-200 rounded w-1/2"></div>
    <div className="col-span-4 h-5 bg-gray-200 rounded w-full"></div>
  </div>
);

// -----------------------------------
// Glavna komponenta
// -----------------------------------

export const AgentPerformancePage = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRankings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOperatorRankings();
      setRankings(data);
    } catch (error) {
      toast.error("Could not fetch agent performance data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const filteredRankings = useMemo(() => {
    if (!searchQuery) {
      return rankings;
    }
    return rankings.filter((agent) => {
      const fullName = `${agent.firstName} ${agent.lastName}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
  }, [rankings, searchQuery]);

  const totalPages = Math.ceil(filteredRankings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAgents = filteredRankings.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Resetuj na prvu stranu kada se promeni search ili broj elemenata po strani
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  return (
    <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
      <SupportAdminNavbar />

      <main className="container mx-auto px-4 md:px-6 py-12 flex-grow">
        <div className="max-w-5xl mx-auto">
          <AdminSection title="Agent Performance" icon={<BarChart size={24} />}>
            {/* Search bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Kontrola prikaza */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 text-sm">
                Showing {filteredRankings.length > 0 ? startIndex + 1 : 0}–
                {Math.min(startIndex + itemsPerPage, filteredRankings.length)}{" "}
                of {filteredRankings.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Items per page:</span>
                <Select
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                  defaultValue={String(itemsPerPage)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabela zaglavlje */}
            <div className="grid grid-cols-12 gap-4 pb-3 border-b px-2 mt-4">
              <span className="col-span-1 text-center font-semibold text-sm text-gray-500 uppercase tracking-wider">
                Rank
              </span>
              <span className="col-span-4 font-semibold text-sm text-gray-500 uppercase tracking-wider">
                Agent Name
              </span>
              <span className="col-span-3 font-semibold text-sm text-gray-500 uppercase tracking-wider">
                Average Rating
              </span>
              <span className="col-span-4 font-semibold text-sm text-gray-500 uppercase tracking-wider">
                Resolved and Rated Tickets
              </span>
            </div>

            {/* Lista agenata */}
            <div className="mt-2 divide-y divide-gray-100">
              <AnimatePresence>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <PerformanceRowSkeleton key={i} />
                  ))
                ) : currentAgents.length > 0 ? (
                  currentAgents.map((agent, index) => (
                    <PerformanceRow
                      key={agent.operatorId}
                      rank={startIndex + index + 1}
                      agent={agent}
                    />
                  ))
                ) : (
                  <div className="pt-6">
                    <EmptyState isSearchActive={searchQuery.length > 0} />
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Paginacija */}
            {!loading && filteredRankings.length > itemsPerPage && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </AdminSection>
        </div>
      </main>

      <Footer />
    </div>
  );
};
