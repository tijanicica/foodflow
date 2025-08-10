import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getDriverPerformance, updateDriverVehicle, updateDriverStatus } from '@/services/api';
// Ikonice iz Feather Icons
import { FiGrid, FiUser, FiLogOut, FiEdit2, FiSave, FiXCircle, FiTruck, FiClock, FiThumbsDown, FiStar, FiToggleRight, FiToggleLeft } from 'react-icons/fi';
// Ikonice iz drugih setova
import { BsBicycle } from 'react-icons/bs';
import { AiFillCar } from 'react-icons/ai';
import { FaMotorcycle } from 'react-icons/fa'; // <-- ISPRAVAN IMPORT

const VEHICLE_OPTIONS = [
    { value: 'CAR', label: 'Car', icon: <AiFillCar /> },
    { value: 'MOTORCYCLE', label: 'Motorcycle', icon: <FaMotorcycle /> }, // <-- ISPRAVLJENA IKONICA
    { value: 'BICYCLE', label: 'Bicycle', icon: <BsBicycle /> },
];

const PerformanceCard = ({ label, value, icon }) => (
    <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    }}>
        <div style={{ color: '#8A643B', fontSize: '2rem' }}>{icon}</div>
        <div>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: '500' }}>{label}</p>
            <p style={{ color: '#1F2937', fontSize: '1.75rem', fontWeight: 'bold' }}>{value}</p>
        </div>
    </div>
);

const VehicleIcon = ({ vehicleType }) => {
    const vehicle = VEHICLE_OPTIONS.find(v => v.value === vehicleType);
    if (!vehicle) return null;
    return <span style={{ marginRight: '0.5rem' }}>{vehicle.icon}</span>;
};

export function DriverProfilePage() {
    const navigate = useNavigate();
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingVehicle, setEditingVehicle] = useState(false);
    const [newVehicle, setNewVehicle] = useState('');
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getDriverPerformance();
                setPerformance(data);
                setNewVehicle(data.vehicleType || '');
                setIsOnline(data.isOnline ?? true);
            } catch (err) {
                setError('Could not load performance data. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        navigate('/login', { replace: true });
    };

    const handleVehicleSave = async () => {
        try {
            if (!newVehicle) return alert('Please select a vehicle.');
            await updateDriverVehicle({ newVehicleType: newVehicle });
            setPerformance(prev => ({ ...prev, vehicleType: newVehicle }));
            setEditingVehicle(false);
        } catch (err) {
            alert('Failed to update vehicle. Please try again.');
        }
    };

    const handleToggleStatus = async () => {
        try {
            const newStatus = isOnline ? "OFFLINE" : "ONLINE";
            await updateDriverStatus({ newStatus });
            setIsOnline(prev => !prev);
        } catch (err) {
            alert('Failed to update status. Please try again.');
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
    if (error) return <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>Error: {error}</div>;

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#FFFBEB',
            minHeight: '100vh',
            color: '#333'
        }}>
            {/* Navigacija */}
            <header style={{
                backgroundColor: 'white',
                borderBottom: '1px solid #EAEAEA',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <nav style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#8A643B' }}>FoodFlow Driver</h1>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <Link to="/driver" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#4A4A4A' }}>
                            <FiGrid /> Dashboard
                        </Link>
                        <Link to="/driver/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', borderBottom: '2px solid #8A643B', textDecoration: 'none', color: '#4A4A4A', paddingBottom: '0.25rem' }}>
                            <FiUser /> My Profile
                        </Link>
                        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#8A643B', border: 'none', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            <FiLogOut /> Logout
                        </button>
                    </div>
                </nav>
            </header>

            {/* Glavni Sadržaj */}
            <main style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>

                {/* Profil Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{performance.firstName} {performance.lastName}</h2>
                        <p style={{ marginTop: '0.5rem', fontSize: '1.2rem', color: '#6B7280' }}>Driver Profile & Performance</p>
                    </div>
                    <div onClick={handleToggleStatus} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '0.75rem 1.25rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <span style={{ fontWeight: '600', fontSize: '1.1rem', color: isOnline ? 'green' : 'red' }}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                        {isOnline ? <FiToggleRight size={30} color="green" /> : <FiToggleLeft size={30} color="red" />}
                    </div>
                </div>

                {/* Performance Sekcija */}
                <section>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Performance Metrics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                        <PerformanceCard label="Total Deliveries" value={performance.totalDeliveries ?? 0} icon={<FiTruck />} />
                        <PerformanceCard label="On-time Rate" value={`${((performance.onTimeRate ?? 0) * 100).toFixed(0)}%`} icon={<FiClock />} />
                        <PerformanceCard label="Rejections" value={performance.rejections ?? 0} icon={<FiThumbsDown />} />
                        <PerformanceCard label="Average Rating" value={(performance.averageRating ?? 0).toFixed(1)} icon={<FiStar />} />
                    </div>
                </section>

                {/* Account Details Sekcija */}
                <section style={{ marginTop: '3rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Account Settings</h3>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ color: '#6B7280', fontSize: '1rem' }}>Vehicle Type</span>
                                {editingVehicle ? (
                                    <select
                                        value={newVehicle}
                                        onChange={(e) => setNewVehicle(e.target.value)}
                                        style={{ marginLeft: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: 'white', fontSize: '1rem' }}
                                    >
                                        <option value="" disabled>Select vehicle</option>
                                        {VEHICLE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center' }}>
                                        <VehicleIcon vehicleType={performance.vehicleType} />
                                        {performance.vehicleType ? VEHICLE_OPTIONS.find(v => v.value === performance.vehicleType).label : 'Not set'}
                                    </div>
                                )}
                            </div>
                            <div>
                                {editingVehicle ? (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={handleVehicleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#28a745', color: 'white', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: '600' }}>
                                            <FiSave /> Save
                                        </button>
                                        <button onClick={() => setEditingVehicle(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#6c757d', color: 'white', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: '600' }}>
                                            <FiXCircle /> Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => setEditingVehicle(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', border: 'none', color: '#8A643B', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
                                        <FiEdit2 /> Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}