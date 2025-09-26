// Datoteka: src/pages/AdminDriverReportPage.jsx

import React, { useState } from 'react';

import { getDriverPerformanceReport } from '@/services/api';
import { AdminNavbar } from '@/components/AdminNavbar';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react'; // Uklonjeni nekorišćeni importi
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

// Glavna komponenta stranice
export function AdminDriverReportPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    // Postavljamo početni datum na pre mesec dana
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date;
    });
    const [endDate, setEndDate] = useState(new Date());
    const [status, setStatus] = useState('ALL');

    const handleGenerateReport = async () => {
        setLoading(true);
        setReports([]);
        const toastId = toast.loading("Generating report...");
        try {
            const startDateFormatted = startDate.toISOString().split('T')[0];
            const endDateFormatted = endDate.toISOString().split('T')[0];

            // 1. Dobijamo PODATKE KOJI SU VEĆ PARSIRANI sa backend-a
            const data = await getDriverPerformanceReport(startDateFormatted, endDateFormatted, status);
            
            // 2. NEMA VIŠE PARSIRANJA! Samo postavljamo dobijene podatke.
            setReports(data);

            toast.success(`Report generated for ${data.length} drivers.`, { id: toastId });
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to generate report.";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCF8]">
            <AdminNavbar />
            <main className="container mx-auto p-6 lg:p-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Advanced Driver Report</h1>
                    <p className="mt-2 text-lg text-gray-500">In-depth performance analysis with custom filters.</p>
                </motion.div>

                {/* Filteri (ostaju isti) */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 p-6 bg-white rounded-xl shadow-md border border-gray-100 flex flex-wrap items-center gap-6">
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-600 mb-1">Start Date</label>
                        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} className="w-full p-2 border border-gray-300 rounded-md" dateFormat="dd.MM.yyyy" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-600 mb-1">End Date</label>
                        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} className="w-full p-2 border border-gray-300 rounded-md" dateFormat="dd.MM.yyyy" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-600 mb-1">Driver Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                            <option value="ALL">All</option>
                            <option value="ONLINE">Online</option>
                            <option value="OFFLINE">Offline</option>
                        </select>
                    </div>
                    <button onClick={handleGenerateReport} disabled={loading} className="self-end px-6 py-2 bg-yellow-500 text-white font-bold rounded-lg shadow-md hover:bg-yellow-600 transition-colors duration-300 disabled:bg-gray-400">
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </motion.div>

                {/* Prikaz izveštaja (ostaje isti) */}
                <div className="mt-8 space-y-6">
                    {reports.map((report) => (
                        <DriverReportCard key={report.driverId} report={report} />
                    ))}
                </div>
            </main>
        </div>
    );
}

// SVE KOMPONENTE ZA PRIKAZ OSTAJU POTPUNO ISTE JER VEĆ RADE SA ISPRAVNIM FORMATOM

const DriverReportCard = ({ report }) => {
    // Provera za null vrednost pre formatiranja
    const onTimeRateValue = report.overallOnTimeRate !== null ? `${(report.overallOnTimeRate * 100).toFixed(0)}%` : 'N/A';

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gray-50/70 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">{report.driverFullName}</h2>
                <p className="text-sm text-gray-500">Analysis for period: {report.analysisPeriod}</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <MetricItem icon={<CheckCircle className="text-green-500" />} label="Overall On-Time Rate" value={onTimeRateValue} />
                    <MetricItem icon={<XCircle className="text-red-500" />} label="Total Rejected Offers" value={report.totalRejectedOffers} />
                </div>

                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Performance By Restaurant</h3>
                    <div className="space-y-3">
                        {report.performanceByRestaurant?.length > 0 ? report.performanceByRestaurant.map(r => (
                            <RestaurantPerformanceItem key={r.restaurantName} restaurant={r} />
                        )) : <p className="text-gray-500">No deliveries from any restaurant in this period.</p>}
                    </div>
                </div>
            </div>

            {report.delayedOrdersDetails?.length > 0 && (
                 <div className="px-6 pb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Delayed Orders Analysis</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
                                <tr>
                                    <th className="px-4 py-2">Order ID</th>
                                    <th className="px-4 py-2">Restaurant</th>
                                    <th className="px-4 py-2">Reported Delay</th>
                                    <th className="px-4 py-2">Actual Time</th>
                                    <th className="px-4 py-2">Was On-Time?</th>
                                    <th className="px-4 py-2">Manager Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.delayedOrdersDetails.map((d, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="px-4 py-2 font-medium">{d.orderId}</td>
                                        <td className="px-4 py-2">{d.restaurantName}</td>
                                        <td className="px-4 py-2">{d.reportedDelayMinutes} min</td>
                                        <td className="px-4 py-2">{d.actualDeliveryMinutes} min</td>
                                        <td className={`px-4 py-2 font-semibold ${d.wasOnTime ? 'text-green-600' : 'text-red-600'}`}>{d.wasOnTime ? 'Yes' : 'No'}</td>
                                        <td className="px-4 py-2">{d.managerRatingAvg.toFixed(1)} ★</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const MetricItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-4">
        <div className="text-2xl">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const RestaurantPerformanceItem = ({ restaurant }) => (
    <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
        <span className="font-bold text-gray-700">{restaurant.restaurantName}</span>
        <div className="text-right">
            <p className="text-sm font-semibold">{restaurant.totalDeliveries} deliveries</p>
            <p className={`text-xs font-bold ${restaurant.onTimeRate >= 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                {(restaurant.onTimeRate * 100).toFixed(0)}% on-time | Avg. {restaurant.avgDeliveryTimeMinutes.toFixed(1)} min
            </p>
        </div>
    </div>
);