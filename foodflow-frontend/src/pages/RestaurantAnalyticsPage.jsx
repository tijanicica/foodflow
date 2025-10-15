// src/pages/RestaurantAnalyticsPage.jsx
import React, { useState, useEffect } from "react";
import { SupportAdminNavbar } from "@/components/SupportAdminNavbar";
import { Footer } from "@/components/Footer";
import { getRestaurantAnalytics, sendAnalyticsToManager } from "@/services/api";
import {
  BarChart,
  Mail,
  AlertTriangle,
  BadgeCheck,
  Clock,
  List,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const AnalyticsCard = ({ data: initialData, restaurantId }) => {
  const [isSending, setIsSending] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState(initialData);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const formattedStartDate = startDate
        ? new Date(startDate).toISOString()
        : null;
      const formattedEndDate = endDate
        ? new Date(endDate + "T23:59:59").toISOString()
        : null;

      const refreshedData = await getRestaurantAnalytics(
        restaurantId,
        formattedStartDate,
        formattedEndDate
      );
      setData(refreshedData);
      toast.success("Analytics refreshed");
    } catch (error) {
      toast.error("Failed to refresh analytics");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const formattedStartDate = startDate
        ? new Date(startDate).toISOString()
        : null;
      const formattedEndDate = endDate
        ? new Date(endDate + "T23:59:59").toISOString()
        : null;

      await sendAnalyticsToManager(
        restaurantId,
        formattedStartDate,
        formattedEndDate
      );

      const dateRangeText =
        startDate && endDate ? ` for ${startDate} to ${endDate}` : "";
      toast.success(`Report${dateRangeText} sent to ${data.managerName}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to send report. Manager might not have an email."
      );
    } finally {
      setIsSending(false);
    }
  };

  const isSendDisabled =
    isSending || data.managerEmail === "N/A" || !data.managerEmail;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{data.restaurantName}</h3>
          <p className="text-sm text-gray-500">
            Managed by: {data.managerName}
          </p>
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={18} className="text-brand-primary" />
          <h4 className="font-semibold text-sm">Filter by Date Range</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || undefined}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={isSendDisabled}
            size="sm"
            className="flex-1 bg-brand-primary hover:bg-brand-primary/90"
            title={
              isSendDisabled && data.managerEmail === "N/A"
                ? "Manager has no email"
                : ""
            }
          >
            {isSending ? (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send PDF to Manager
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
        <div title="Open Tickets">
          <AlertTriangle className="mx-auto text-orange-500" />{" "}
          <span className="font-bold text-lg">{data.openTickets}</span> Open
        </div>
        <div title="Closed Tickets">
          <BadgeCheck className="mx-auto text-green-600" />{" "}
          <span className="font-bold text-lg">{data.closedTickets}</span> Closed
        </div>
        <div title="Total Tickets">
          <List className="mx-auto text-blue-500" />{" "}
          <span className="font-bold text-lg">{data.totalTickets}</span> Total
        </div>
        <div title="Avg. Resolution Time">
          <Clock className="mx-auto text-purple-500" />{" "}
          <span className="font-bold text-lg">
            {data.averageResolutionTime}
          </span>{" "}
          Avg. Time
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <h4 className="font-semibold mb-2">Tickets by Category:</h4>
        <ul className="space-y-1 text-sm">
          {data.categoryBreakdown.length > 0 ? (
            data.categoryBreakdown.map((cat) => (
              <li
                key={cat.categoryName}
                className="flex justify-between p-2 bg-gray-50 rounded"
              >
                <span>{cat.categoryName}</span>
                <span className="font-bold">{cat.ticketCount}</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">
              No tickets found for this restaurant in the selected period.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
};

export const RestaurantAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getRestaurantAnalytics();
        setAnalytics(data);
      } catch (error) {
        toast.error("Failed to load restaurant analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
      <SupportAdminNavbar />
      <main className="container mx-auto px-4 py-12 flex-grow">
        <h2 className="text-3xl font-bold mb-6 flex items-center">
          <BarChart className="mr-3" />
          Restaurant Support Analytics
        </h2>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="animate-spin h-8 w-8 text-brand-primary" />
            <span className="ml-3 text-gray-600">Loading analytics...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analytics.map((data) => (
              <AnalyticsCard
                key={data.restaurantId}
                data={data}
                restaurantId={data.restaurantId}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
