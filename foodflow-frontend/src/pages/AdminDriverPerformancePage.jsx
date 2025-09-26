import React, { useState, useEffect } from 'react';
import { getAllDriverPerformances,deleteDriverById } from '@/services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star, TrendingUp, TrendingDown, Users, CheckCircle, PlusCircle, BarChart2  } from 'lucide-react';
import { AdminNavbar } from '@/components/AdminNavbar';
import { RegisterDriverModal } from '@/components/modals/RegisterDriverModal';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { Link } from 'react-router-dom';


export const DriverRow = ({ driver, index, onDeleteRequest }) => {
     if (index === 0) console.log('CEO OBJEKAT VOZAČA:', driver);
    const onTimePercentage = (driver.onTimeRate * 100).toFixed(0);
    const rating = driver.averageRating.toFixed(1);

    const getOnTimeColorClass = (percentage) => {
        const p = parseInt(percentage, 10);
        if (p >= 95) return 'bg-green-100 text-green-700';
        if (p >= 80) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    const getRatingColorClass = (rating) => {
        const r = parseFloat(rating);
        if (r >= 4.5) return 'text-green-500';
        if (r >= 3.5) return 'text-yellow-500';
        if (r > 0) return 'text-red-500';
        return 'text-gray-400';
    };

    // Pomoćna funkcija koja se poziva na klik "Delete" dugmeta
     const handleDriverDelete = async () => {
        // Čuvamo podatke o vozaču pre nego što resetujemo state
        const driverIdToDelete = confirmState.driverId;
        const driverNameToDelete = confirmState.driverName;
    
        // ODMAH zatvaramo modal da korisnik vidi da se nešto dešava
        setConfirmState({ isOpen: false, driverId: null, driverName: '' });
    
        if (!driverIdToDelete) return;
    
        // Prikazujemo "loading" toast dok se operacija ne završi
        const deleteToast = toast.loading(`Brisanje vozača ${driverNameToDelete}...`);
    
        try {
            await deleteDriverById(driverIdToDelete);
            
            // Ažuriramo toast sa porukom o uspehu
            toast.success(`Vozač ${driverNameToDelete} je uspešno arhiviran i obrisan.`, {
                id: deleteToast,
            });
            
            // Ažuriraj listu vozača na ekranu
            setDrivers(currentDrivers => currentDrivers.filter(d => d.id !== driverIdToDelete));
    
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || "Došlo je do greške pri brisanju.";
            
            // Ažuriramo toast sa porukom o grešci
            toast.error(errorMessage, {
                id: deleteToast,
            });
        }
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
            <td className="px-6 py-4 text-right">
                <button 
    onClick={() => {
        // Proveravamo da li klik uopšte radi
        console.log(`Kliknuto na DELETE za vozača ID: ${driver.driverId}`); // <-- ISPRAVKA OVDE
        
        // Pozivamo funkciju koju smo dobili kao prop
        onDeleteRequest(driver.driverId, `${driver.firstName} ${driver.lastName}`); // <-- ISPRAVKA OVDE
    }}
    className="text-sm font-semibold text-red-500 hover:text-red-700"
>
    Delete
</button>
            </td>
        </motion.tr>
    );
};

// === Glavna Stranica ===
export function AdminDriverPerformancePage() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmState, setConfirmState] = useState({ isOpen: false, driverId: null, driverName: '' });

    // Izdvajamo dohvatanje podataka u posebnu funkciju
    const fetchData = async () => {
        // Ne postavljamo loading na true za osvežavanje da bi se izbeglo treperenje
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

    useEffect(() => {
        setLoading(true); // Loading je true samo pri prvom učitavanju
        fetchData();
    }, []);

    // Funkcija koja se poziva nakon uspešne registracije
    const handleRegistrationSuccess = () => {
        setIsModalOpen(false); // Zatvori modal
        fetchData(); // Ponovo dohvati podatke da se prikaže novi vozač
    };

const handleDriverDelete = async () => {
    // Get the id and name from the state
    const driverIdToDelete = confirmState.driverId;
    const driverNameToDelete = confirmState.driverName;

    // Immediately close the dialog
    setConfirmState({ isOpen: false, driverId: null, driverName: '' });

    if (!driverIdToDelete) {
        toast.error("Driver ID was not found. Could not delete.");
        return;
    }

    const deleteToast = toast.loading(`Deleting driver ${driverNameToDelete}...`);
    try {
        await deleteDriverById(driverIdToDelete);
        toast.success(`Driver ${driverNameToDelete} successfully deleted.`, { id: deleteToast });
        
        // <-- IZMENA JE OVDE
        // Ponovo dohvati sve podatke sa servera da bi se lista osvežila.
        fetchData(); 

    } catch (error) {
        const errorMessage = error.response?.data?.message || error.response?.data || "An error occurred.";
        toast.error(errorMessage, { id: deleteToast });
    }
};

    const topPerformer = drivers[0];
    const lowPerformer = drivers[drivers.length - 1];
    const CHART_PALETTE = ['#A17A4B', '#FBBF24', '#D4A056', '#C0843D', '#E6B88A'];
    const barChartData = drivers.map(d => ({ name: `${d.firstName.charAt(0)}. ${d.lastName}`, 'Average Rating': parseFloat(d.averageRating.toFixed(1)), 'On-Time %': parseFloat((d.onTimeRate * 100).toFixed(0)), })).slice(0, 10);
    const pieChartData = drivers.filter(d => d.totalDeliveries > 0).map(d => ({ name: `${d.firstName} ${d.lastName}`, value: d.totalDeliveries, }));
    
    return (
        <>
            <RegisterDriverModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleRegistrationSuccess}
            />
<ConfirmDialog
    isOpen={confirmState.isOpen}
    onClose={() => setConfirmState({ isOpen: false, driverId: null, driverName: '' })}
    onConfirm={handleDriverDelete}
    title="Confirm Deletion"
    description={`Are you sure you want to permanently delete the driver "${confirmState.driverName}"? This action cannot be undone.`}
/>
            <div className="min-h-screen bg-[#FDFCF8]">
                <AdminNavbar />
                <main className="container mx-auto p-6 lg:p-10">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Driver Performance</h1>
                            <p className="mt-2 text-lg text-gray-500">An analytical overview of metrics for all active drivers for the last 30 days.</p>
                        </div>
                        <div className="flex items-center gap-4">
                        {/* NOVO DUGME */}
                        <Link to="/admin/reports/driver-performance" className="flex items-center gap-2 bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md border border-gray-300 hover:bg-gray-100 transition-colors duration-300">
                            <BarChart2 size={20} />
                            Advanced Report
                        </Link>
                        
                        {/* Postojeće dugme */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-yellow-600 transition-colors duration-300"
                        >
                            <PlusCircle size={20} />
                            Register New Driver
                        </button>
                    </div>
                    </motion.div>

                    {loading ? (
                        <div className="mt-12 text-center text-gray-600">Loading performance data...</div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                            {/* STATS CARDS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard icon={<Users />} title="Total Drivers" value={drivers.length} />
                                {topPerformer && <StatCard icon={<TrendingUp />} title="Top Rating" value={`${topPerformer.firstName} (${topPerformer.averageRating.toFixed(1)})`} color="green" />}
                                {lowPerformer && <StatCard icon={<TrendingDown />} title="Lowest Rating" value={`${lowPerformer.firstName} (${lowPerformer.averageRating.toFixed(1)})`} color="red" />}
                                <StatCard icon={<CheckCircle />} title="Total Deliveries" value={drivers.reduce((acc, d) => acc + d.totalDeliveries, 0)} />
                            </div>

                            {/* TABELA */}
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
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                  <tbody className="divide-y divide-gray-200">
    {drivers.length > 0 ? (
        drivers.map((driver, index) => (
            <DriverRow 
                key={driver.id} 
                driver={driver} 
                index={index}
                // OVA LINIJA FALI - ona povezuje klik na dugme sa otvaranjem modala
                onDeleteRequest={(driverId, driverName) => 
                    setConfirmState({ isOpen: true, driverId, driverName })
                }
            />
        ))
    ) : (
        // I OVDE ISPRAVI colSpan
        <tr>
            <td colSpan="7" className="p-8 text-center text-gray-500">
                No driver data available.
            </td>
        </tr>
    )}
</tbody>
                                                                </table>
                            </div>

                            {/* GRAFIKONI */}
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
        </>
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