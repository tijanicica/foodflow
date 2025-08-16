// src/pages/ManagerDashboard.jsx

import React, { useState, useEffect } from 'react';
// Potrebno je instalirati 'recharts': npm install recharts
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DollarSign, ShoppingCart, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar'; // Proverite putanju
import { getManagerAnalytics, getMyRestaurants } from '@/services/api'; 
import toast from 'react-hot-toast';

// Kartica sa statistikom, sada sa roze/ljubičastom temom
const StatCard = ({ title, value, unit, icon, subValue }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 transition-transform transform hover:-translate-y-1 duration-300">
        <div className="bg-pink-100 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {subValue ? (
                <div className="flex items-end space-x-4 mt-1">
                    <div className="flex items-center">
                        <CheckCircle className="text-green-500 h-5 w-5 mr-1.5" />
                        <p className="text-2xl font-bold text-gray-800">{value}</p>
                    </div>
                    <div className="flex items-center">
                        <XCircle className="text-red-500 h-5 w-5 mr-1.5" />
                        <p className="text-2xl font-bold text-gray-800">{subValue}</p>
                    </div>
                </div>
            ) : (
                <p className="text-2xl font-bold text-gray-800">
                    {value}
                    {unit && <span className="text-base font-normal text-gray-500 ml-1">{unit}</span>}
                </p>
            )}
        </div>
    </div>
);

// Grafikon za prikaz učinka artikala
const ItemPerformanceChart = ({ data }) => (
    <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0.9}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="itemName" stroke="#4b5563" fontSize={12} tick={{ fill: '#4b5563' }} />
                <YAxis stroke="#4b5563" />
                <Tooltip 
                    cursor={{fill: 'rgba(236, 72, 153, 0.1)'}}
                    contentStyle={{
                        background: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '0.5rem',
                    }}
                />
                <Bar dataKey="orderCount" fill="url(#colorUv)" name="Orders" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="text-center py-20 bg-white rounded-xl shadow-lg">
        <p className="text-gray-500 text-lg">{message}</p>
    </div>
);


export function ManagerDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterDays, setFilterDays] = useState(30);
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(''); 

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const data = await getMyRestaurants();
                setRestaurants(data);
            } catch (error) {
                toast.error("Nije moguće učitati listu restorana.");
            }
        };
        fetchRestaurants();
    }, []);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const restaurantId = selectedRestaurant ? Number(selectedRestaurant) : null;
                const data = await getManagerAnalytics(filterDays, restaurantId);
                // Sortiramo artikle po broju porudžbina za bolji prikaz na grafikonu
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
    
    // Uzimamo samo top 5 artikala za pregledniji grafikon
    const topItems = analytics?.itemPerformance?.slice(0, 5) || [];


    return (
        <div className="w-full min-h-screen bg-pink-50/50">
            <ManagerNavbar />
            <main className="container mx-auto px-4 md:px-6 py-10">
                {/* Personalizovani pozdrav */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Restaurant Analytics</h1>
                    <p className="text-gray-500 mt-1">Dobrodošli nazad! Evo pregleda poslovanja.</p>
                </div>
                
                <div className="flex flex-wrap justify-end items-center gap-4 mb-8">
                    <select 
                        value={selectedRestaurant} 
                        onChange={(e) => setSelectedRestaurant(e.target.value)}
                        className="bg-white border border-gray-300 rounded-lg py-2 px-4 shadow-sm focus:ring-2 focus:ring-pink-400 focus:outline-none transition"
                    >
                        <option value="">All Restaurants</option>
                        {restaurants.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    <select 
                        value={filterDays} 
                        onChange={(e) => setFilterDays(Number(e.target.value))}
                        className="bg-white border border-gray-300 rounded-lg py-2 px-4 shadow-sm focus:ring-2 focus:ring-pink-400 focus:outline-none transition"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                </div>

                {loading ? <LoadingSpinner /> : analytics ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <StatCard 
                                title="Total Revenue" 
                                value={(analytics.totalRevenue / 1000).toFixed(1)} 
                                unit="K RSD"
                                icon={<DollarSign className="text-pink-500" />}
                            />
                            <StatCard 
                                title="Total Orders" 
                                value={analytics.totalOrders} 
                                icon={<ShoppingCart className="text-pink-500" />}
                            />
                            <StatCard 
                                title="Confirmed / Canceled" 
                                value={analytics.confirmedOrders}
                                subValue={analytics.canceledOrders}
                                icon={<CheckCircle className="text-pink-500" />}
                            />
                            <StatCard 
                                title="Avg. Response Time" 
                                value={analytics.avgResponseTimeMinutes.toFixed(0)} 
                                unit="min"
                                icon={<Clock className="text-pink-500" />}
                            />
                        </div>
                        
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-5">Top 5 Best-Selling Items</h2>
                            {topItems.length > 0 ? (
                                <ItemPerformanceChart data={topItems} />
                            ) : (
                                <p className="text-center text-gray-500 py-10">Nema dovoljno podataka za prikaz grafikona.</p>
                            )}
                        </div>
                    </>
                ) : <EmptyState message="Nema dostupnih podataka za izabrane filtere." />}
            </main>
        </div>
    );
}