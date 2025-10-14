// src/pages/OperatorAnalyticsPage.jsx

import React, { useState, useEffect } from "react";
import { OperatorNavbar } from "@/components/OperatorNavbar";
import { Footer } from "@/components/Footer";
import { getOperatorAnalytics } from "@/services/api";
import toast from "react-hot-toast";
import {
  BarChart,
  Clock,
  Star,
  Activity,
  Calendar,
  CheckSquare,
} from "lucide-react";
import {
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { DateRangePicker } from "@/components/DateRangePicker";

const BRAND_COLORS = [
  "#4F4A40",
  "#C8B48C",
  "#8A7E68",
  "#EAE3D3",
  "#B0A48A",
  "#6E6658",
];

const MetricCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-start gap-4">
    <div className="bg-brand-background-light p-3 rounded-lg text-brand-primary">
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const AnalyticsSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="h-24 bg-white rounded-2xl shadow-sm border"></div>
      <div className="h-24 bg-white rounded-2xl shadow-sm border"></div>
      <div className="h-24 bg-white rounded-2xl shadow-sm border"></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="h-96 bg-white rounded-2xl shadow-sm border"></div>
      <div className="h-96 bg-white rounded-2xl shadow-sm border"></div>
    </div>
  </div>
);

export const OperatorAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        console.log(
          "OperatorAnalyticsPage: Šaljem dateRange u API poziv:",
          dateRange
        );
        const data = await getOperatorAnalytics(dateRange);
        setAnalytics(data);
      } catch (error) {
        toast.error("Failed to load your analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [dateRange]);

  const handleDateUpdate = (range) => {
    console.log("OperatorAnalyticsPage: DateRangePicker je vratio:", range);
    setDateRange(range || { from: undefined, to: undefined });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
        <OperatorNavbar />
        <main className="container mx-auto px-4 md:px-6 py-12 flex-grow">
          <AnalyticsSkeleton />
        </main>
        <Footer />
      </div>
    );
  }
  if (!analytics) return <div>No data available.</div>;

  const chartData = analytics.ticketsPerCategory.map((item) => ({
    name: item.categoryName,
    value: Number(item.ticketCount),
  }));

  return (
    <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
      <OperatorNavbar />
      <main className="container mx-auto px-4 md:px-6 py-12 flex-grow">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              My Performance Analytics
            </h1>
            {dateRange.from || dateRange.to ? (
              <p className="text-sm text-gray-600">
                Period:{" "}
                {dateRange.from
                  ? new Date(dateRange.from).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Start"}{" "}
                -{" "}
                {dateRange.to
                  ? new Date(dateRange.to).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "End"}
              </p>
            ) : (
              <p className="text-sm text-gray-600">Period: All time</p>
            )}
          </div>
          <DateRangePicker onUpdate={handleDateUpdate} />
        </div>
        {/* Kartice sa ključnim metrikama */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Resolved in Period"
            value={analytics.totalTicketsInPeriod}
            icon={<Calendar size={24} />}
          />
          <MetricCard
            title="Resolved (All Time)"
            value={analytics.totalTicketsAllTime}
            icon={<CheckSquare size={24} />}
          />
          <MetricCard
            title="My Average Rating"
            value={
              analytics.averageRating
                ? analytics.averageRating.toFixed(2)
                : "N/A"
            }
            icon={<Star size={24} />}
          />
          <MetricCard
            title="My Avg. Resolution Time"
            value={analytics.averageResolutionTime}
            icon={<Clock size={24} />}
          />
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            My Resolved Tickets by Category
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <RechartsBarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" stroke="#A1A1AA" />
              <YAxis stroke="#A1A1AA" />
              <Tooltip
                cursor={{ fill: "#FFFBF5" }}
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #EAE3D3",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="value" name="Tickets" barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BRAND_COLORS[index % BRAND_COLORS.length]}
                  />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </main>
      <Footer />
    </div>
  );
};
