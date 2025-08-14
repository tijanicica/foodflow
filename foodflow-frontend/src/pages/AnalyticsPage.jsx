import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { getMyAnalytics } from '@/services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Wallet, ShoppingCart, Heart, Timer, BarChartBig } from 'lucide-react'; // Uvezene nove ikonice
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';


// --- REDIZAJNIRANE POMOĆNE KOMPONENTE ---

const StatCard = ({ title, value, unit = '', icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="bg-[#F9F5EC] p-3 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800">
                {value} <span className="text-xl font-medium text-gray-600">{unit}</span>
            </p>
        </div>
    </div>
);

const AnalyticsPageSkeleton = () => (
    <div className="w-full min-h-screen bg-[#F9F5EC]">
        <Navbar />
        <main className="container mx-auto px-4 md:px-6 py-8 animate-pulse">
            <div className="h-10 w-1/3 bg-gray-200 rounded-md mb-8"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="h-28 bg-white rounded-xl shadow-sm"></div>
                <div className="h-28 bg-white rounded-xl shadow-sm"></div>
                <div className="h-28 bg-white rounded-xl shadow-sm"></div>
                <div className="h-28 bg-white rounded-xl shadow-sm"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-80 bg-white rounded-xl shadow-sm"></div>
                <div className="h-80 bg-white rounded-xl shadow-sm"></div>
            </div>
        </main>
    </div>
);

const EmptyState = () => (
     <div className="text-center py-16 px-6 bg-white rounded-xl border border-dashed">
        <BarChartBig className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-xl font-semibold text-gray-800">Not Enough Data</h3>
        <p className="mt-1 text-gray-500">Start making orders to see your personal analytics.</p>
        <Link to="/home">
            <Button className="mt-6 bg-[#D4A056] hover:bg-[#c8924a]">Find Restaurants</Button>
        </Link>
    </div>
);

// --- GLAVNA REDIZAJNIRANA KOMPONENTA ---

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

    if (loading) return <AnalyticsPageSkeleton />;
    if (!analytics) return (
        <div className="w-full min-h-screen bg-[#F9F5EC]">
            <Navbar />
            <main className="container mx-auto px-4 md:px-6 py-8">
                 <h1 className="text-4xl font-bold text-[#4A4A4A] mb-8">Your Analytics</h1>
                 <EmptyState />
            </main>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-[#F9F5EC]">
            <Navbar />
            <main className="container mx-auto px-4 md:px-6 py-8">
                <h1 className="text-4xl font-bold text-[#4A4A4A] mb-8">Your Analytics</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Orders" value={analytics.totalOrders} icon={<ShoppingCart size={24} className="text-[#D4A056]" />} />
                    <StatCard title="Total Spent" value={analytics.totalSpent.toLocaleString()} unit="RSD" icon={<Wallet size={24} className="text-[#D4A056]" />} />
                    <StatCard title="Favorite Restaurant" value={analytics.favoriteRestaurant} icon={<Heart size={24} className="text-[#D4A056]" />} />
                    <StatCard title="Avg. Delivery Time" value={analytics.averageDeliveryTime} unit="min" icon={<Timer size={24} className="text-[#D4A056]" />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Chart 1: Monthly Spending (Redesigned as Area Chart) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-3">
                        <h2 className="font-bold text-lg mb-4 text-gray-700">Monthly Spending (Last 6 Months)</h2>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={analytics.spendingOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4A056" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#D4A056" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                                <Tooltip contentStyle={{ background: 'white', borderRadius: '10px', border: '1px solid #eee' }} formatter={(value) => `${value.toLocaleString()} RSD`} />
                                <Area type="monotone" dataKey="amount" stroke="#D4A056" fillOpacity={1} fill="url(#colorSpending)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Chart 2: Top 5 Restaurants (Visually improved) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
                        <h2 className="font-bold text-lg mb-4 text-gray-700">Top 5 Restaurants</h2>
                        <ResponsiveContainer width="100%" height={350}>
                             <BarChart data={analytics.categorySpending} layout="vertical" margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#fafafa' }} contentStyle={{ background: 'white', borderRadius: '10px', border: '1px solid #eee' }} formatter={(value) => `${value.toLocaleString()} RSD`} />
                                <Bar dataKey="value" fill="#4A4A4A" radius={[0, 8, 8, 0]} barSize={20}>
                                    <LabelList dataKey="value" position="right" formatter={(value) => `${Math.round(value/1000)}k`} fontSize={12} fill="#333" />
                                 </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
                  <Footer />
            
        </div>
    );
}