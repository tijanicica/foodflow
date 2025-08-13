import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { getMyAnalytics } from '@/services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Legend } from 'recharts';

// Pomoćna komponenta za kartice (malo stilizovana)
const StatCard = ({ title, value, unit = '' }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-4xl font-bold text-gray-800 mt-2">
            {value} <span className="text-2xl font-medium text-gray-600">{unit}</span>
        </p>
    </div>
);

// Gradijent boje za bar chart
const GradientBar = (props) => {
    const { fill, x, y, width, height, value } = props;
    // Logika za gradijent: što je veća vrednost, to je tamnija boja
    const maxAmount = 10000; // Pretpostavljena maksimalna mesečna potrošnja
    const opacity = 0.6 + (value / maxAmount) * 0.4;
    return <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={opacity} />;
};


export function AnalyticsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getMyAnalytics();
                setAnalytics(data);
            } catch (error) {
                toast.error("Could not load analytics.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center p-10">Loading analytics...</div>;
    if (!analytics) return <div className="text-center p-10">No data available to generate analytics.</div>;

    return (
        <div className="w-full min-h-screen bg-[#F9F5EC]">
            <Navbar />
            <main className="container mx-auto px-4 md:px-6 py-8">
                <h1 className="text-4xl font-bold text-[#4A4A4A] mb-8">Your Analytics</h1>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Orders" value={analytics.totalOrders} />
                    <StatCard title="Total Spent" value={analytics.totalSpent.toLocaleString()} unit="RSD" />
                    <StatCard title="Favorite Restaurant" value={analytics.favoriteRestaurant} />
                    <StatCard title="Avg. Delivery Time" value={analytics.averageDeliveryTime} unit="min" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEVI GRAFIKON - Mesečna potrošnja */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="font-bold text-lg mb-4 text-gray-700">Monthly Spending (Last 6 Months)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.spendingOverTime} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'rgba(212, 160, 86, 0.1)' }} formatter={(value) => `${value.toLocaleString()} RSD`} />
                                <Bar dataKey="amount" fill="#D4A056" shape={<GradientBar />}>
                                    <LabelList dataKey="amount" position="top" formatter={(value) => `${Math.round(value/1000)}k`} fontSize={12} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* DESNI GRAFIKON - Potrošnja po restoranu */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="font-bold text-lg mb-4 text-gray-700">Top 5 Restaurants by Spending</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.categorySpending} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'rgba(74, 74, 74, 0.1)' }} formatter={(value) => `${value.toLocaleString()} RSD`} />
                                <Bar dataKey="value" fill="#4A4A4A" radius={[0, 4, 4, 0]}>
                                    <LabelList dataKey="value" position="right" formatter={(value) => `${value.toLocaleString()} RSD`} fontSize={12} />
                                 </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
        </div>
    );
}