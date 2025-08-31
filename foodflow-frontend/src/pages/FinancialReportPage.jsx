import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getCustomerFinancialReport } from '@/services/api';
import toast from 'react-hot-toast';
import { Wallet, Percent, CreditCard, Coins, ShoppingBag, Sun, Sunset, Moon, TrendingUp, Landmark } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

// --- Помоћне компоненте у стилу ваше апликације ---

const ReportCard = ({ title, value, icon, unit = '', isCurrency = false }) => (
    <motion.div 
        className="bg-white p-6 rounded-2xl shadow-sm border"
        whileHover={{ translateY: -5 }}
    >
        <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <div className="bg-brand-background/50 p-2 rounded-lg">{icon}</div>
        </div>
        <p className="text-3xl font-bold text-gray-800">
            {isCurrency ? (value || 0).toLocaleString('sr-RS') : value} <span className="text-xl font-medium text-gray-600">{unit}</span>
        </p>
    </motion.div>
);

const MostExpensiveOrderCard = ({ order }) => (
    <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex justify-between items-center">
            <p className="font-bold text-brand-primary truncate">{order.restaurant_name}</p>
            <p className="text-lg font-bold">{(order.total_price || 0).toLocaleString('sr-RS')} <span className="text-sm font-normal">RSD</span></p>
        </div>
        <p className="text-xs text-gray-500">Order #{order.order_id} on {new Date(order.order_date).toLocaleDateString('sr-RS')}</p>
    </div>
);

const COLORS = ['#4F4A40', '#8a8174', '#C8B48C'];

// --- Главна компонента странице ---

export function FinancialReportPage() {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                // Претпостављамо да желимо извештај за текућу годину
                const year = new Date().getFullYear();
                const startDate = `${year}-01-01`;
                const endDate = `${year}-12-31`;
                const data = await getCustomerFinancialReport(startDate, endDate);
                setReport(data);
            } catch (error) {
                toast.error("Could not load your financial report.");
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);
    
    // Skeleton loader
    if (loading) return <div>Loading...</div>; // Можете направити лепши skeleton loader
    if (!report) return <div>Could not load report.</div>;

    return (
        <div className="w-full min-h-screen bg-[#F9F5EC]">
            <Navbar />
            <main className="container mx-auto px-4 md:px-6 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-extrabold text-[#4A4A4A]">Financial Footprint</h1>
                    <p className="text-lg text-gray-500 mt-1">A detailed look at your spending habits for {report.analysis_period}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <ReportCard title="Total Spent" value={report.total_spent} icon={<Wallet size={24} />} isCurrency unit="RSD"/>
                    <ReportCard title="Coupon Savings" value={report.total_coupon_savings} icon={<Percent size={24} />} isCurrency unit="RSD"/>
                    <ReportCard title="Paid by Card" value={report.total_paid_by_card} icon={<CreditCard size={24} />} isCurrency unit="RSD"/>
                    <ReportCard title="Paid by Cash" value={report.total_paid_by_cash} icon={<Coins size={24} />} isCurrency unit="RSD"/>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border">
                        <h2 className="font-bold text-xl mb-4 text-gray-700">Spending by Time of Day</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={report.spending_by_time_of_day}>
                                <XAxis dataKey="period_name" stroke="#888888" fontSize={10} />
                                <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `${value/1000}k`}/>
                                <Tooltip cursor={{fill: 'rgba(79, 74, 64, 0.05)'}} contentStyle={{ background: 'white', borderRadius: '10px' }} formatter={(value) => `${(value || 0).toLocaleString('sr-RS')} RSD`} />
                                <Bar dataKey="spent_in_period" name="Spent" radius={[4, 4, 0, 0]}>
                                    {report.spending_by_time_of_day.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border">
                        <h2 className="font-bold text-xl mb-4 text-gray-700">Spending by Restaurant Price Range</h2>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={report.spending_by_price_range}>
                                <XAxis dataKey="price_range" stroke="#888888" fontSize={12} />
                                <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `${value/1000}k`}/>
                                <Tooltip cursor={{fill: 'rgba(79, 74, 64, 0.05)'}} contentStyle={{ background: 'white', borderRadius: '10px' }} formatter={(value) => `${(value || 0).toLocaleString('sr-RS')} RSD`} />
                                <Bar dataKey="spent_in_range" name="Spent" radius={[4, 4, 0, 0]}>
                                     {report.spending_by_price_range.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h2 className="font-bold text-xl mb-4 text-gray-700">Your Top 5 Most Expensive Orders</h2>
                    <div className="space-y-3">
                        {report.top_5_most_expensive_orders && report.top_5_most_expensive_orders.length > 0 ? (
                            report.top_5_most_expensive_orders.map(order => <MostExpensiveOrderCard key={order.order_id} order={order} />)
                        ) : (
                            <p className="text-gray-500 text-center py-8">No significantly expensive orders found in this period.</p>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}