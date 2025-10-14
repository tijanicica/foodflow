// src/pages/SupportAnalyticsPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { SupportAdminNavbar } from "@/components/SupportAdminNavbar";
import { Footer } from "@/components/Footer";
import { getSupportAnalytics } from "@/services/api";
import toast from "react-hot-toast";
import { BarChart, Clock, Star, Activity } from "lucide-react";
import {
  Bar,
  BarChart as RechartsBarChart,
  Pie,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { DateRangePicker } from "@/components/DateRangePicker";

// Brand-aligned color palette for charts
const BRAND_COLORS = [
  "#4F4A40", // brand-primary
  "#C8B48C", // brand-accent
  "#8A7E68", // A muted version of primary
  "#EAE3D3", // brand-background (lighter)
  "#B0A48A", // A darker accent
  "#6E6658", // Another muted primary
];

// Component for a single metric card
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

// Skeleton loading component
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

// ===================================================================
// ===== ADVANCED CUSTOM LABEL FOR PIE CHART WITH TEXT WRAPPING ======
// ===================================================================
const RADIAN = Math.PI / 180;
const CustomPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}) => {
  // Calculate the position for the label outside the pie
  const radius = outerRadius * 1.4; // Increase multiplier for more space
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? "start" : "end";

  // Logic to wrap the text
  const wrappedText = useMemo(() => {
    const maxCharsPerLine = 18; // Adjust this value to control wrapping
    const words = name.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      if (
        (currentLine + " " + word).length > maxCharsPerLine &&
        currentLine.length > 0
      ) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? `${currentLine} ${word}` : word;
      }
    });
    lines.push(currentLine);
    return lines;
  }, [name]);

  return (
    <>
      {/* The elegant connector line */}
      <path
        d={`M${cx + outerRadius * Math.cos(-midAngle * RADIAN)},${
          cy + outerRadius * Math.sin(-midAngle * RADIAN)
        } L${cx + outerRadius * 1.2 * Math.cos(-midAngle * RADIAN)},${
          cy + outerRadius * 1.2 * Math.sin(-midAngle * RADIAN)
        } L${x},${y}`}
        stroke="#C8B48C"
        fill="none"
      />
      {/* The text block with tspans for each line */}
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fill="#4F4A40"
        className="text-sm font-medium"
      >
        {wrappedText.map((line, index) => (
          <tspan key={index} x={x} dy={index === 0 ? 0 : "1.2em"}>
            {line}
          </tspan>
        ))}
        <tspan x={x} dy="1.4em" fill="#8A7E68">{`(${(percent * 100).toFixed(
          0
        )}%)`}</tspan>
      </text>
    </>
  );
};

export const SupportAnalyticsPage = () => {
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
          "SupportAnalyticsPage: Šaljem dateRange u API poziv:",
          dateRange
        );
        const data = await getSupportAnalytics(dateRange);
        setAnalytics(data);
      } catch (error) {
        toast.error("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [dateRange]);

  const handleDateUpdate = (range) => {
    console.log("SupportAnalyticsPage: DateRangePicker je vratio:", range);
    setDateRange(range || { from: undefined, to: undefined });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
        <SupportAdminNavbar />
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
      <SupportAdminNavbar />
      <main className="container mx-auto px-4 md:px-6 py-12 flex-grow">
        <div className="mb-8 flex justify-end">
          <DateRangePicker onUpdate={handleDateUpdate} />
        </div>
        {/* Key metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Tickets (Period)" // <-- Promenjen naslov
            value={analytics.totalTickets}
            icon={<Activity size={24} />}
          />
          <MetricCard
            title="Overall Average Rating"
            value={
              analytics.overallAverageRating
                ? analytics.overallAverageRating.toFixed(2)
                : "N/A"
            }
            icon={<Star size={24} />}
          />
          <MetricCard
            title="Average Resolution Time"
            value={analytics.averageResolutionTime}
            icon={<Clock size={24} />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Bar Chart - Tickets per Category */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Tickets by Category
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <RechartsBarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <XAxis type="number" stroke="#A1A1AA" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  stroke="#A1A1AA"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#FFFBF5" }}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #EAE3D3",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="value" name="Tickets" barSize={25}>
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

          {/* Pie Chart - Category Distribution */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Category Distribution
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <RechartsPieChart
                margin={{ top: 20, right: 50, bottom: 20, left: 50 }}
              >
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={<CustomPieLabel />}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={BRAND_COLORS[index % BRAND_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #EAE3D3",
                    borderRadius: "0.5rem",
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Resolution Time by Category */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Average Resolution Time by Category
          </h3>
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-2 gap-4 px-4 py-2 font-semibold text-gray-600 bg-gray-50 rounded">
              <span>Category</span>
              <span className="text-right">Average Time</span>
            </div>
            {/* Data */}
            {analytics.performancePerCategory &&
              analytics.performancePerCategory.map((item) => (
                <div
                  key={item.categoryName}
                  className="grid grid-cols-2 gap-4 px-4 py-2 border-b last:border-b-0"
                >
                  <span>{item.categoryName}</span>
                  <span className="text-right font-medium">
                    {item.averageResolutionTime}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
