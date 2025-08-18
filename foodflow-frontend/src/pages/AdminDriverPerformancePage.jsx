import React, { useState, useEffect } from 'react';
import { getAllDriverPerformances } from '@/services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star, TrendingUp, TrendingDown, Users, CheckCircle } from 'lucide-react';
import { AdminNavbar } from '@/components/AdminNavbar';

// === Unapređen Red Tabele (vraćen u <tr> format) ===
const DriverRow = ({ driver, index }) => {
    const onTimePercentage = (driver.onTimeRate * 100).toFixed(0);
    const rating = driver.averageRating.toFixed(1);

    const getOnTimeColorClass = (percentage) => {
        if (percentage >= 95) return 'bg-green-100 text-green-700';
        if (percentage >= 80) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    const getRatingColorClass = (rating) => {
        if (rating >= 4.0) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <motion.tr
            className="hover:bg-gray-50/50 transition-colors duration-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
        >
            <td className="px-6 py-4 text-sm font-semibold text-gray-400">{index + 1}.</td>
            <td className="px-6 py-4">
                <div className="font-bold text-gray-800">{driver.firstName} {driver.lastName}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">{driver.vehicleType}</div>
            </td>
            <td className="px-6 py-4">
                <div className={`flex items-center gap-1.5 font-bold text-md ${getRatingColorClass(rating)}`}>
                    <Star className="h-5 w-5 fill-current" />
                    <span>{rating}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className={`px-3 py-1 text-sm font-semibold rounded-full inline-block ${getOnTimeColorClass(onTimePercentage)}`}>
                    {onTimePercentage}%
                </div>
            </td>
            <td className="px-6 py-4 text-center font-bold text-gray-700">{driver.totalDeliveries}</td>
            <td className={`px-6 py-4 text-center font-extrabold text-lg ${driver.rejections > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {driver.rejections}
            </td>
        </motion.tr>
    );
};

export function AdminDriverPerformancePage() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getAllDriverPerformances();
                const sortedData = data.sort((a, b) => b.averageRating - a.averageRating);
                setDrivers(sortedData);
            } catch (err) {
                toast.error("Failed to load driver performance data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const topPerformer = drivers[0];
    const lowPerformer = drivers[drivers.length - 1];

    // --- Harmonized Color Palette ---
    const CHART_PALETTE = ['#A17A4B', '#FBBF24', '#D4A056', '#C0843D', '#E6B88A'];

    const barChartData = drivers.map(d => ({ name: `${d.firstName.charAt(0)}. ${d.lastName}`, 'Average Rating': parseFloat(d.averageRating.toFixed(1)), 'On-Time %': parseFloat((d.onTimeRate * 100).toFixed(0)), })).slice(0, 10);
    const pieChartData = drivers.filter(d => d.totalDeliveries > 0).map(d => ({ name: `${d.firstName} ${d.lastName}`, value: d.totalDeliveries, }));
    
    return (
        <div className="min-h-screen bg-[#FDFCF8]">
            <AdminNavbar />
            <main className="container mx-auto p-6 lg:p-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Driver Performance</h1>
                    <p className="mt-2 text-lg text-gray-500">An analytical overview of metrics for all active drivers for the last 30 days.</p>
                </motion.div>

                {loading ? (
                    <div className="mt-12 text-center text-gray-600">Loading performance data...</div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, staggerChildren: 0.1 }}>
                        {/* === STATS CARDS === */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={<Users />} title="Total Drivers" value={drivers.length} />
                            {topPerformer && <StatCard icon={<TrendingUp />} title="Top Rating" value={`${topPerformer.firstName} (${topPerformer.averageRating.toFixed(1)})`} color="green" />}
                            {lowPerformer && <StatCard icon={<TrendingDown />} title="Lowest Rating" value={`${lowPerformer.firstName} (${lowPerformer.averageRating.toFixed(1)})`} color="red" />}
                            <StatCard icon={<CheckCircle />} title="Total Deliveries" value={drivers.reduce((acc, d) => acc + d.totalDeliveries, 0)} />
                        </div>

                        {/* === REDESIGNED DRIVER TABLE === */}
                        <div className="mt-12 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">#</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Driver Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Average Rating</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">On-Time (%)</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Deliveries</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Rejections</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {drivers.length > 0 ? (
                                        drivers.map((driver, index) => <DriverRow key={driver.id} driver={driver} index={index} />)
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-gray-500">No driver data available.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* === REDESIGNED CHARTS === */}
                        <div className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-3 bg-white rounded-xl shadow-md border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-gray-800">Top 10 Drivers by Performance</h2>
                                <p className="text-sm text-gray-500 mb-6">Comparison of average rating and on-time delivery percentage.</p>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="name" fontSize={12} tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} />
                                        <Legend iconType="circle" />
                                        <Bar dataKey="Average Rating" fill={CHART_PALETTE[0]} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="On-Time %" fill={CHART_PALETTE[1]} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-gray-800">Delivery Distribution</h2>
                                <p className="text-sm text-gray-500 mb-6">Driver's share of total deliveries.</p>
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie data={pieChartData} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" nameKey="name">
                                            {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

// === Reusable Helper Components ===
const StatCard = ({ icon, title, value, color }) => {
    const colorClasses = {
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        default: 'bg-blue-100 text-blue-600'
    };
    const selectedColor = colorClasses[color] || colorClasses.default;

    return (
        <motion.div 
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5"
            whileHover={{ scale: 1.03 }}
        >
            <div className={`p-3 rounded-lg ${selectedColor}`}>
                {React.cloneElement(icon, { className: "h-6 w-6" })}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </motion.div>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-3 rounded-lg shadow-lg">
                <p className="font-bold text-gray-700">{label}</p>
                {payload.map((pld, index) => (
                    <p key={index} style={{ color: pld.fill }} className="font-semibold">
                        {`${pld.name}: ${pld.value}${pld.dataKey === 'On-Time %' ? '%' : ''}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};