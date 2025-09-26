// Datoteka: src/pages/AdminDriverReportPage.jsx

import React, { useState } from 'react';

import { getDriverPerformanceReport } from '@/services/api';
import { AdminNavbar } from '@/components/AdminNavbar';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Calendar, Users, BarChart2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css"; // Stil za date picker
import DatePicker from "react-datepicker"; // Importujemo komponentu




// U AdminDriverReportPage.jsx

const parsePgRow = (rowStr) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

const parsePgArray = (str) => {
    if (!str || str === '{}' || str === '[null]') {
        return [];
    }
    // Uklanja {"(" na početku i ")}" na kraju
    const cleanStr = str.slice(3, -3);
    // Deli na pojedinačne zapise
    const records = cleanStr.split(')","(');
    
    return records.map(parsePgRow);
}


const parseVehiclePerformance = (str) => {
    const parsedData = parsePgArray(str);
    return parsedData.map(parts => {
        if (parts.length < 5) return null;
        return {
            vehicleType: parts[0],
            totalDeliveries: parseInt(parts[1], 10),
            onTimeDeliveries: parseInt(parts[2], 10),
            onTimeRate: parseFloat(parts[3]),
            avgDeliveryTimeMinutes: parseFloat(parts[4]),
        };
    }).filter(Boolean);
};

const parseDelayedOrders = (str) => {
    const parsedData = parsePgArray(str);
    return parsedData.map(parts => {
        if (parts.length < 6) return null;
        return {
            orderId: parseInt(parts[0], 10),
            restaurantName: parts[1],
            reportedDelayMinutes: parseInt(parts[2], 10),
            actualDeliveryMinutes: parseFloat(parts[3]),
            wasOnTime: parts[4] === 't',
            managerRatingAvg: parseFloat(parts[5]),
        };
    }).filter(Boolean);
};

// Glavna komponenta stranice
export function AdminDriverReportPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const [endDate, setEndDate] = useState(new Date());
    const [status, setStatus] = useState('ALL');

    const handleGenerateReport = async () => {
        setLoading(true);
        setReports([]); // Očisti prethodne rezultate
        const toastId = toast.loading("Generating report...");
        try {
            const startDateFormatted = startDate.toISOString().split('T')[0];
            const endDateFormatted = endDate.toISOString().split('T')[0];

            const data = await getDriverPerformanceReport(startDateFormatted, endDateFormatted, status);
            
            const parsedData = data.map(report => ({
                ...report,
                performanceByVehicle: parseVehiclePerformance(report.performanceByVehicle),
                delayedOrdersDetails: parseDelayedOrders(report.delayedOrdersDetails),
            }));

            setReports(parsedData);
            toast.success(`Report generated for ${parsedData.length} drivers.`, { id: toastId });
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

                {/* Filteri */}
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

                {/* Prikaz izveštaja */}
                <div className="mt-8 space-y-6">
                    {reports.map((report) => (
                        <DriverReportCard key={report.driverId} report={report} />
                    ))}
                </div>
            </main>
        </div>
    );
}

// Komponenta za prikaz pojedinačnog izveštaja
const DriverReportCard = ({ report }) => {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gray-50/70 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">{report.driverFullName}</h2>
                <p className="text-sm text-gray-500">Analysis for period: {report.analysisPeriod}</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metrike */}
                <div className="md:col-span-1 space-y-4">
                    <MetricItem icon={<CheckCircle className="text-green-500" />} label="Overall On-Time Rate" value={`${(report.overallOnTimeRate * 100).toFixed(0)}%`} />
                    <MetricItem icon={<XCircle className="text-red-500" />} label="Total Rejected Offers" value={report.totalRejectedOffers} />
                </div>

                {/* Performanse po vozilu */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Performance By Vehicle</h3>
                    <div className="space-y-3">
                        {report.performanceByVehicle?.length > 0 ? report.performanceByVehicle.map(v => (
                            <VehiclePerformanceItem key={v.vehicleType} vehicle={v} />
                        )) : <p className="text-gray-500">No deliveries with any vehicle in this period.</p>}
                    </div>
                </div>
            </div>

            {/* Analiza kašnjenja */}
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

const VehiclePerformanceItem = ({ vehicle }) => (
    <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
        <span className="font-bold text-gray-700">{vehicle.vehicleType}</span>
        <div className="text-right">
            <p className="text-sm font-semibold">{vehicle.totalDeliveries} deliveries</p>
            <p className={`text-xs font-bold ${vehicle.onTimeRate >= 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                {(vehicle.onTimeRate * 100).toFixed(0)}% on-time | Avg. {vehicle.avgDeliveryTimeMinutes.toFixed(1)} min
            </p>
        </div>
    </div>
);