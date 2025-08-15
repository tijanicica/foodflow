import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { getMyAnalytics } from '@/services/api';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { Wallet, ShoppingCart, Heart, Timer, BarChartBig, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Pomoćne komponente (sada sa kompletnim kodom) ---

const StatCard = ({ title, value, unit = '', icon, change, isCurrency = false }) => (
    <motion.div 
        className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between"
        whileHover={{ translateY: -5, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
    >
        <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <div className="bg-brand-background/50 p-2 rounded-lg">{icon}</div>
        </div>
        <div>
            <p className="text-3xl font-bold text-gray-800 mt-2">
                {isCurrency ? (value || 0).toLocaleString() : value} <span className="text-xl font-medium text-gray-600">{unit}</span>
            </p>
            {change != null && <p className={`text-xs font-semibold flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp size={14} className={change < 0 ? 'transform -rotate-45' : ''}/> {change >= 0 ? `+${change}%` : `${change}%`} vs last period
            </p>}
        </div>
    </motion.div>
);

const EmptyState = () => (
     <div className="text-center py-16 px-6 bg-white rounded-2xl border-2 border-dashed">
        <BarChartBig className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-xl font-semibold text-gray-800">Not Enough Data</h3>
        <p className="mt-1 text-gray-500">Start making orders to see your personal analytics.</p>
        <Button asChild className="mt-6 bg-brand-primary hover:bg-brand-primary/90"><Link to="/home">Find Restaurants</Link></Button>
    </div>
);

const AnalyticsPageSkeleton = () => (
    <div className="w-full min-h-screen bg-[#F9F5EC]">
        <Navbar />
        <main className="container mx-auto px-4 md:px-6 py-12 animate-pulse">
            <div className="flex justify-between items-center mb-8">
                <div className="h-16 w-1/3 bg-gray-200 rounded-lg"></div>
                <div className="h-10 w-48 bg-gray-200 rounded-md"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-white rounded-2xl shadow-sm"></div>)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="h-96 bg-white rounded-2xl shadow-sm lg:col-span-2"></div>
                <div className="h-96 bg-white rounded-2xl shadow-sm"></div>
            </div>
        </main>
        <Footer />
    </div>
);

// Boje za Pie Chart
const COLORS = ['#4F4A40', '#8a8174', '#C8B48C', '#EAE3D3', '#a79d89'];

//================================================================================
// GLAVNA KOMPONENTA STRANICE
//================================================================================

export function AnalyticsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMyAnalytics({ period: timeRange }); 
            setAnalytics(data);
        } catch (error) { toast.error("Could not load analytics."); } 
        finally { setLoading(false); }
    }, [timeRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <AnalyticsPageSkeleton />;
    if (!analytics) return (
        <div className="w-full min-h-screen bg-[#F9F5EC]"><Navbar /><main className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold text-[#4A4A4A] mb-8">Your Analytics</h1><EmptyState /></main><Footer /></div>
    );

    return (
        <div className="w-full min-h-screen bg-[#F9F5EC]">
            <Navbar />
            <main className="container mx-auto px-4 md:px-6 py-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-5xl font-extrabold text-[#4A4A4A]">Your Analytics</h1>
                        <p className="text-lg text-gray-500 mt-1">An overview of your ordering habits.</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Select onValueChange={setTimeRange} defaultValue={timeRange}>
                            <SelectTrigger className="w-[180px] bg-white shadow-sm h-11">
                                <SelectValue placeholder="Select time range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                                <SelectItem value="6m">Last 6 Months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Spent" value={analytics.totalSpent} unit="RSD" icon={<Wallet size={24} className="text-brand-primary" />} change={analytics.totalSpentChange} isCurrency/>
                    <StatCard title="Total Orders" value={analytics.totalOrders} icon={<ShoppingCart size={24} className="text-brand-primary" />} change={analytics.totalOrdersChange}/>
                    <StatCard title="Favorite Restaurant" value={analytics.favoriteRestaurant || 'N/A'} icon={<Heart size={24} className="text-brand-primary" />} />
                    <StatCard title="Avg. Delivery Time" value={analytics.averageDeliveryTime} unit="min" icon={<Timer size={24} className="text-brand-primary" />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm lg:col-span-2">
                        <h2 className="font-bold text-xl mb-4 text-gray-700">Spending Over Time</h2>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={analytics.spendingOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C8B48C" stopOpacity={0.7}/>
                                        <stop offset="95%" stopColor="#C8B48C" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="timePoint" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                                <Tooltip contentStyle={{ background: 'white', borderRadius: '10px', border: '1px solid #eee' }} formatter={(value) => `${(value || 0).toLocaleString()} RSD`} />
                                <Area type="monotone" dataKey="amount" stroke="#4F4A40" fill="url(#colorSpending)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="font-bold text-xl mb-4 text-gray-700">Top Restaurants</h2>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie data={analytics.topRestaurants} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {(analytics.topRestaurants || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${(value || 0).toLocaleString()} RSD`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                 <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border">
                    <h2 className="font-bold text-xl mb-3 text-gray-700 flex items-center gap-2"><TrendingUp size={20}/> Your Habits</h2>
                    <p className="text-gray-600">{analytics.insightText || "Keep ordering to discover interesting insights about your habits!"}</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}