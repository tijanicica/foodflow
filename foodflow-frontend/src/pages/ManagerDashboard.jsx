// src/pages/ManagerDashboard.jsx

import React, { useState, useEffect } from 'react';
import { ManagerNavbar } from '@/components/ui/ManagerNavbar'; // Proveri putanju
import { getManagerAnalytics, getMyRestaurants } from '@/services/api'; 
import toast from 'react-hot-toast';

const StatCard = ({ title, value, unit }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex-1 text-center">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-brand-primary">{value}<span className="text-lg ml-1">{unit}</span></p>
    </div>
);

const ItemPerformanceRow = ({ name, count }) => (
    <div className="flex justify-between items-center py-3 border-b last:border-b-0">
        <p className="text-md text-gray-700">{name}</p>
        <p className="text-md font-semibold text-brand-primary">{count} orders</p>
    </div>
);

// ===== ISPRAVLJENO IME FUNKCIJE =====
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
                toast.error("Could not load restaurant list.");
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
                setAnalytics(data);
            } catch (err) {
                toast.error('Failed to fetch analytics.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [filterDays, selectedRestaurant]);

    return (
        <div className="w-full min-h-screen bg-brand-background-light">
            <ManagerNavbar />
            <main className="container mx-auto px-4 md:px-6 py-8">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-brand-primary">Restaurant Analytics</h1>
                    <div className="flex items-center gap-4">
                        <select 
                            value={selectedRestaurant} 
                            onChange={(e) => setSelectedRestaurant(e.target.value)}
                            className="bg-white border border-gray-300 rounded-md py-2 px-4"
                        >
                            <option value="">All Restaurants</option>
                            {restaurants.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        <select 
                            value={filterDays} 
                            onChange={(e) => setFilterDays(Number(e.target.value))}
                            className="bg-white border border-gray-300 rounded-md py-2 px-4"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                    </div>
                </div>

                {loading ? <p>Loading analytics...</p> : analytics ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard title="Total Revenue" value={(analytics.totalRevenue / 1000).toFixed(1)} unit="K RSD" />
                            <StatCard title="Total Orders" value={analytics.totalOrders} />
                            <StatCard title="Confirmed / Canceled" value={`${analytics.confirmedOrders} / ${analytics.canceledOrders}`} />
                            <StatCard title="Avg. Response Time" value={analytics.avgResponseTimeMinutes.toFixed(0)} unit="min" />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-brand-primary mb-4">Item Performance</h2>
                            {analytics.itemPerformance && analytics.itemPerformance.length > 0 ? (
                                analytics.itemPerformance.map((item, index) => (
                                    <ItemPerformanceRow key={index} name={item.itemName} count={item.orderCount} />
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">No item data for the selected period.</p>
                            )}
                        </div>
                    </>
                ) : <p>No data available.</p>}
            </main>
        </div>
    );
}