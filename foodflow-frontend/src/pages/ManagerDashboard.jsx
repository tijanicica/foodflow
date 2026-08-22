import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { DollarSign, ShoppingCart, CheckCircle, XCircle, Clock, BarChartBig, TrendingUp } from 'lucide-react';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar';
import { getManagerAnalytics, getMyRestaurants } from '@/services/api'; 
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

//================================================================================
// POMOĆNE KOMPONENTE
//================================================================================

const StatCard = ({ title, value, unit = '', icon, change, isCurrency = false, value2 = null }) => (
    <motion.div 
        className="bg-white p-6 rounded-2xl shadow-lg border flex flex-col justify-between"
        whileHover={{ translateY: -5, boxShadow: '0 10px 15px -3px rgb(236 72 153 / 0.1), 0 4px 6px -4px rgb(236 72 153 / 0.1)' }}
    >
        <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <div className="bg-pink-100 p-3 rounded-xl">{icon}</div>
        </div>
        <div className="mt-2">
            {value2 !== null ? (
                <div className="flex items-end space-x-4">
                    <div className="flex items-center"><CheckCircle className="text-green-500 h-5 w-5 mr-1.5" /><p className="text-3xl font-bold text-gray-800">{value}</p></div>
                    <div className="flex items-center"><XCircle className="text-red-500 h-5 w-5 mr-1.5" /><p className="text-3xl font-bold text-gray-800">{value2}</p></div>
                </div>
            ) : (
                <div>
                    <p className="text-3xl font-bold text-gray-800">
                        {isCurrency ? (value || 0).toLocaleString() : value}
                        <span className="text-xl font-medium text-gray-600 ml-1.5">{unit}</span>
                    </p>
                    {change != null && (
                        <p className={`text-sm font-semibold flex items-center gap-1 mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <TrendingUp size={16} className={change < 0 ? 'transform rotate-90' : 'transform -rotate-45'}/> 
                            <span>{change > 0 ? `+${change}` : change}% vs last period</span>
                        </p>
                    )}
                </div>
            )}
        </div>
    </motion.div>
);

const ItemPerformanceChart = ({ data }) => (
    <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                <defs>
                    <linearGradient id="colorPink" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#d946ef" stopOpacity={0.9}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="itemName" stroke="#4b5563" fontSize={12} angle={-25} textAnchor="end" interval={0} />
                <YAxis stroke="#4b5563" allowDecimals={false} />
                <Tooltip 
                    cursor={{fill: 'rgba(236, 72, 153, 0.08)'}}
                    contentStyle={{ background: 'white', border: '1px solid #ddd', borderRadius: '0.5rem' }}
                />
                <Bar dataKey="orderCount" fill="url(#colorPink)" name="Orders" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

// Boje za Pie Chart koje se slažu sa roze temom
const PIE_COLORS = ['#ec4899', '#f472b6', '#f9a8d4', '#c084fc', '#e9d5ff'];

const RestaurantPerformancePieChart = ({ data }) => (
    <div className="h-96 w-full">
        <ResponsiveContainer>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString()} RSD`} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    </div>
);

const DashboardSkeleton = () => (
    <div className="w-full min-h-screen bg-pink-50/50">
        <ManagerNavbar />
        <main className="container mx-auto px-4 md:px-6 py-10 animate-pulse">
            <div className="h-12 w-1/2 bg-gray-200 rounded-lg mb-8"></div>
            <div className="flex justify-end gap-4 mb-8">
                <div className="h-10 w-48 bg-gray-200 rounded-md"></div>
                <div className="h-10 w-48 bg-gray-200 rounded-md"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl shadow-lg"></div>)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                 <div className="h-96 bg-white rounded-2xl shadow-lg lg:col-span-3"></div>
                 <div className="h-96 bg-white rounded-2xl shadow-lg lg:col-span-2"></div>
            </div>
        </main>
    </div>
);

const EmptyState = ({ message }) => (
     <div className="text-center py-16 px-6 bg-white rounded-2xl border-2 border-dashed">
        <BarChartBig className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-xl font-semibold text-gray-800">Nema Podataka</h3>
        <p className="mt-1 text-gray-500">{message}</p>
    </div>
);

//================================================================================
// GLAVNA KOMPONENTA STRANICE
//================================================================================
export function ManagerDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterDays, setFilterDays] = useState('30');
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState('all'); 

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const data = await getMyRestaurants();
                setRestaurants(data);
            } catch (error) { toast.error("Nije moguće učitati listu restorana."); }
        };
        fetchRestaurants();
    }, []);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const restaurantId = selectedRestaurant !== 'all' ? Number(selectedRestaurant) : null;
                const days = Number(filterDays);
                const data = await getManagerAnalytics(days, restaurantId);

                if (data && data.itemPerformance) {
                    data.itemPerformance.sort((a, b) => b.orderCount - a.orderCount);
                }
                setAnalytics(data);
            } catch (err) {
                toast.error('Neuspešno preuzimanje analitike.');
                setAnalytics(null);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [filterDays, selectedRestaurant]);
    
    const topItems = analytics?.itemPerformance?.slice(0, 10) || [];

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="w-full min-h-screen bg-pink-50/50">
            <ManagerNavbar />
            <main className="container mx-auto px-4 md:px-6 py-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-5xl font-extrabold text-gray-800">Dashboard</h1>
                        <p className="text-lg text-gray-500 mt-1">Pregled poslovanja vaših restorana.</p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                         <Select onValueChange={setSelectedRestaurant} value={selectedRestaurant}>
                            <SelectTrigger className="w-[200px] bg-white shadow-sm h-11 border-gray-300">
                                <SelectValue placeholder="Svi Restorani" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Svi Restorani</SelectItem>
                                {restaurants.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={setFilterDays} defaultValue={filterDays}>
                            <SelectTrigger className="w-[180px] bg-white shadow-sm h-11 border-gray-300">
                                <SelectValue placeholder="Vremenski opseg" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Poslednjih 7 dana</SelectItem>
                                <SelectItem value="30">Poslednjih 30 dana</SelectItem>
                                <SelectItem value="90">Poslednjih 90 dana</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {analytics ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <StatCard 
                                title="Ukupan Prihod" 
                                value={analytics.totalRevenue}
                                unit="RSD"
                                icon={<DollarSign size={24} className="text-pink-500" />}
                                isCurrency
                                change={analytics.totalRevenueChange}
                            />
                            <StatCard 
                                title="Ukupno Porudžbina" 
                                value={analytics.totalOrders} 
                                icon={<ShoppingCart size={24} className="text-pink-500" />}
                                change={analytics.totalOrdersChange}
                            />
                            <StatCard 
                                title="Potvrđeno / Otkazano" 
                                value={analytics.confirmedOrders}
                                value2={analytics.canceledOrders}
                                icon={<CheckCircle size={24} className="text-pink-500" />}
                            />
                            <StatCard 
                                title="Prosečno Vreme Odgovora" 
                                value={analytics.avgResponseTimeMinutes.toFixed(0)} 
                                unit="min"
                                icon={<Clock size={24} className="text-pink-500" />}
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg lg:col-span-3">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Učinak Top 10 Artikala</h2>
                                {topItems.length > 0 ? (
                                    <ItemPerformanceChart data={topItems} />
                                ) : (
                                    <p className="text-center text-gray-500 py-16">Nema dovoljno podataka.</p>
                                )}
                            </div>

                            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg lg:col-span-2">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Prihod po Restoranu</h2>
                                {analytics.restaurantPerformance && analytics.restaurantPerformance.length > 0 ? (
                                    <RestaurantPerformancePieChart data={analytics.restaurantPerformance} />
                                ) : (
                                    <p className="text-center text-gray-500 py-16">Podaci dostupni samo za pregled svih restorana.</p>
                                )}
                            </div>
                        </div>
                    </>
                ) : <EmptyState message="Nema dostupnih podataka za izabrane filtere." />}
            </main>
        </div>
    );
}