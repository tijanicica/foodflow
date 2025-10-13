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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const AnalyticsCard = ({ data }) => {
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      await sendAnalyticsToManager(data.restaurantId);
      toast.success(`Report sent to ${data.managerName}`);
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
        <Button
          onClick={handleSendEmail}
          disabled={isSendDisabled}
          title={
            isSendDisabled && data.managerEmail === "N/A"
              ? "Manager has no email"
              : ""
          }
        >
          <Mail className="mr-2 h-4 w-4" />
          {isSending ? "Sending..." : "Send PDF to Manager"}
        </Button>
      </div>

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
              No tickets found for this restaurant.
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
          <p>Loading analytics...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analytics.map((data) => (
              <AnalyticsCard key={data.restaurantId} data={data} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
