// src/pages/AgentManagementPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { SupportAdminNavbar } from "@/components/SupportAdminNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  getOperators,
  deleteOperator,
  downloadOperatorReport,
} from "@/services/api";
import toast from "react-hot-toast";
import { RegisterAgentModal } from "@/components/modals/RegisterOperatorModal";
import { PlusCircle, Users, Trash2, Download, ListChecks } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { OperatorHistoryModal } from "@/components/modals/OperatorHistoryModal";
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
import { DateRangeModal } from "@/components/modals/DateRangeModal";
import { useNavigate } from "react-router-dom";

const AdminSection = ({ title, icon, action, children }) => (
  <motion.div
    className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="bg-brand-background-light p-3 rounded-lg text-brand-primary">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      {action}
    </div>
    <div>{children}</div>
  </motion.div>
);

const AgentRow = ({
  agent,
  onRemoveClick,
  onViewHistoryClick,
  onDownloadClick,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 px-2 items-center text-base hover:bg-gray-50/80 rounded-lg transition-colors"
    >
      <span className="font-medium text-brand-primary">
        {agent.firstName} {agent.lastName}
      </span>
      <span className="text-gray-600">{agent.email}</span>
      <div className="text-left md:text-right flex gap-3 items-center justify-end">
        <Button
          variant="ghost"
          className="text-brand-primary/70 hover:text-brand-primary p-1 h-auto text-base"
          onClick={() => onViewHistoryClick(agent)}
        >
          <ListChecks size={16} className="mr-2" />
        </Button>

        <Button
          variant="ghost"
          className="text-brand-primary/70 hover:text-brand-primary p-1 h-auto text-base"
          onClick={() => onDownloadClick(agent)}
        >
          <Download size={16} className="mr-2" />
        </Button>

        <Button
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto text-base"
          onClick={() => onRemoveClick(agent)}
        >
          <Trash2 size={16} className="mr-2" />
        </Button>
      </div>
    </motion.div>
  );
};

const EmptyState = () => (
  <div className="text-center py-16 px-6 bg-gray-50 rounded-lg border-2 border-dashed">
    <Users className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-4 text-xl font-semibold text-gray-800">
      No Agents Found
    </h3>
    <p className="mt-1 text-gray-500">
      Click "Register New Agent" to add the first one.
    </p>
  </div>
);

const AgentRowSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 px-2 items-center animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
    <div className="flex justify-start md:justify-end">
      <div className="h-5 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

export const OperatorManagementPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);

  // Date range modal states
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);
  const [selectedAgentForReport, setSelectedAgentForReport] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const navigate = useNavigate();

  const fetchAgents = useCallback(async () => {
    try {
      if (agents.length === 0) setLoading(true);
      const data = await getOperators();
      setAgents(data);
    } catch (error) {
      toast.error("Could not fetch agents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [agents.length]);

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleRegistrationSuccess = () => fetchAgents();

  const handleRemoveClick = (agent) => {
    setAgentToDelete(agent);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!agentToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOperator(agentToDelete.id);
      toast.success(
        `Operator ${agentToDelete.firstName} ${agentToDelete.lastName} has been removed.`
      );
      setAgents((prev) => prev.filter((a) => a.id !== agentToDelete.id));
      setIsConfirmOpen(false);
      setAgentToDelete(null);
    } catch (error) {
      toast.error("Failed to remove operator. They may have assigned tickets.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewHistoryClick = (operator) => {
    navigate(`/operator-history/${operator.id}`);
  };

  const handleDownloadClick = (agent) => {
    setSelectedAgentForReport(agent);
    setIsDateRangeModalOpen(true);
  };

  const handleDateRangeSubmit = async (startDate, endDate) => {
    try {
      // Format dates to ISO string if they exist
      const formattedStartDate = startDate
        ? new Date(startDate).toISOString()
        : null;
      const formattedEndDate = endDate
        ? new Date(endDate + "T23:59:59").toISOString()
        : null;

      const blob = await downloadOperatorReport(
        selectedAgentForReport.id,
        formattedStartDate,
        formattedEndDate
      );

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;

      const dateRangeSuffix =
        startDate && endDate ? `_${startDate}_to_${endDate}` : "";

      link.setAttribute(
        "download",
        `report_${selectedAgentForReport.firstName}_${selectedAgentForReport.lastName}${dateRangeSuffix}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success("Report downloaded successfully!");
    } catch (error) {
      toast.error("Could not download report.");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(agents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAgents = agents.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => setCurrentPage(1), [itemsPerPage]);

  return (
    <>
      <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
        <SupportAdminNavbar />

        <main className="container mx-auto px-4 md:px-6 py-12 flex-grow">
          <div className="max-w-5xl mx-auto">
            <AdminSection
              title="All Agents"
              icon={<Users size={24} />}
              action={
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-brand-primary hover:bg-brand-primary/90"
                >
                  <PlusCircle size={16} className="mr-2" /> Register New Agent
                </Button>
              }
            >
              {/* Kontrola prikaza */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 text-sm">
                  Showing {startIndex + 1}–
                  {Math.min(startIndex + itemsPerPage, agents.length)} of{" "}
                  {agents.length}
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

              {/* Zaglavlje liste */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-3 border-b px-2 mt-4">
                <span className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
                  Agent Name
                </span>
                <span className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
                  Email
                </span>
                <span className="font-semibold text-sm text-gray-500 uppercase tracking-wider text-left md:text-right">
                  Actions
                </span>
              </div>

              {/* Lista agenata */}
              <div className="mt-2 divide-y divide-gray-100">
                <AnimatePresence>
                  {loading ? (
                    [...Array(3)].map((_, i) => <AgentRowSkeleton key={i} />)
                  ) : currentAgents.length > 0 ? (
                    currentAgents.map((agent) => (
                      <AgentRow
                        key={agent.id}
                        agent={agent}
                        onRemoveClick={handleRemoveClick}
                        onViewHistoryClick={handleViewHistoryClick}
                        onDownloadClick={handleDownloadClick}
                      />
                    ))
                  ) : (
                    <div className="pt-6">
                      <EmptyState />
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Paginacija */}
              {!loading && agents.length > 0 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 1))
                        }
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

      <RegisterAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Operator"
        description={`Are you sure you want to remove ${agentToDelete?.firstName} ${agentToDelete?.lastName}? This action cannot be undone.`}
        isLoading={isDeleting}
      />
      <OperatorHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        operator={selectedOperator}
      />
      <DateRangeModal
        isOpen={isDateRangeModalOpen}
        onClose={() => {
          setIsDateRangeModalOpen(false);
          setSelectedAgentForReport(null);
        }}
        onSubmit={handleDateRangeSubmit}
        operatorName={
          selectedAgentForReport
            ? `${selectedAgentForReport.firstName} ${selectedAgentForReport.lastName}`
            : ""
        }
      />
    </>
  );
};
