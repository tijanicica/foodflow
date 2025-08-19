// src/pages/AgentPerformancePage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { SupportAdminNavbar } from "@/components/SupportAdminNavbar";
import { Footer } from "@/components/Footer";
import { getOperatorRankings } from "@/services/api"; // <-- Novi import
import toast from "react-hot-toast";
import { BarChart, Star, Users, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Pomoćna komponenta za sekcije, ista kao pre
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

// Pomoćna komponenta za prikaz reda u tabeli sa novim podacima
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

const EmptyState = () => (
  <div className="text-center py-16 px-6 bg-gray-50 rounded-lg border-2 border-dashed">
    <BarChart className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-4 text-xl font-semibold text-gray-800">
      No Performance Data
    </h3>
    <p className="mt-1 text-gray-500">
      Performance data will be shown here once agents start resolving and
      getting rated on support tickets.
    </p>
  </div>
);

// Skeleton za učitavanje
const PerformanceRowSkeleton = () => (
  <div className="grid grid-cols-12 gap-4 py-4 px-2 items-center animate-pulse">
    <div className="col-span-1 h-5 bg-gray-200 rounded w-1/2 mx-auto"></div>
    <div className="col-span-4 h-5 bg-gray-200 rounded w-3/4"></div>
    <div className="col-span-3 h-5 bg-gray-200 rounded w-1/2"></div>
    <div className="col-span-4 h-5 bg-gray-200 rounded w-full"></div>
  </div>
);

export const AgentPerformancePage = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
      <SupportAdminNavbar />

      <main className="container mx-auto px-4 md:px-6 py-12 flex-grow">
        <div className="max-w-5xl mx-auto">
          <AdminSection title="Agent Performance" icon={<BarChart size={24} />}>
            {/* Zaglavlje liste */}
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
                Resolved Tickets
              </span>
            </div>

            {/* Lista rangiranja */}
            <div className="mt-2 divide-y divide-gray-100">
              <AnimatePresence>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <PerformanceRowSkeleton key={i} />
                  ))
                ) : rankings.length > 0 ? (
                  rankings.map((agent, index) => (
                    <PerformanceRow
                      key={agent.operatorId}
                      rank={index + 1}
                      agent={agent}
                    />
                  ))
                ) : (
                  <div className="pt-6">
                    <EmptyState />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </AdminSection>
        </div>
      </main>

      <Footer />
    </div>
  );
};
