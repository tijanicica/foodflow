// FAJL: src/pages/DriverProfilePage.jsx

import React, { useState, useEffect } from 'react';
// Uklonili smo 'useNavigate' i 'Link' jer su sada u Navbaru
import { getDriverPerformance, updateDriverVehicle, updateDriverStatus, getDriverStatus } from '@/services/api';
import { NavbarDriver } from '../components/NavbarDriver'; // <-- UVOZIMO NAVBAR
// Ikonice
import { FiEdit2, FiSave, FiXCircle, FiTruck, FiClock, FiThumbsDown, FiStar } from 'react-icons/fi';
import { BsBicycle } from 'react-icons/bs';
import { AiFillCar } from 'react-icons/ai';
import { FaMotorcycle } from 'react-icons/fa';

const VEHICLE_OPTIONS = [ /* ... ostaje isto ... */ ];
const PerformanceCard = ({ label, value, icon }) => { /* ... ostaje isto ... */ };
const VehicleIcon = ({ vehicleType }) => { /* ... ostaje isto ... */ };
const StatusToggle = ({ isOnline, onToggle }) => { /* ... ostaje isto ... */ };

export function DriverProfilePage() {
    // Uklonili smo 'navigate' jer nam više ne treba ovdje
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingVehicle, setEditingVehicle] = useState(false);
    const [newVehicle, setNewVehicle] = useState('');
    const [isOnline, setIsOnline] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [performanceData, statusData] = await Promise.all([
                    getDriverPerformance(),
                    getDriverStatus()
                ]);
                
                setPerformance(performanceData);
                setNewVehicle(performanceData.vehicleType || '');
                
                const currentStatusIsOnline = statusData.status === 'ONLINE';
                setIsOnline(currentStatusIsOnline);
                localStorage.setItem('driverStatus', statusData.status);

            } catch (err) {
                setError('Could not load profile data. Please try again.');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // handleLogout je sada u NavbarDriver komponenti i ne treba nam ovdje

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
            const updatedDriver = await updateDriverStatus({ newStatus });
            
            const serverStatus = updatedDriver.status;
            localStorage.setItem('driverStatus', serverStatus);
            setIsOnline(serverStatus === 'ONLINE');
        } catch (err) {
            alert('Failed to update status. Please try again.');
        }
    };

    if (loading || isOnline === null) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
    }
    if (error) {
        return <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>Error: {error}</div>;
    }
    if (!performance) {
        return null;
    }

    return (
        <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh', color: '#4A4A4A' }}>
            
            {/* KORISTIMO NOVU NAVBAR KOMPONENTU */}
            <NavbarDriver />

            <main style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: '#333' }}>{performance.firstName} {performance.lastName}</h2>
                        <p style={{ marginTop: '0.5rem', fontSize: '1.2rem', color: '#6B7280' }}>Driver Profile & Performance</p>
                    </div>
                    <StatusToggle isOnline={isOnline} onToggle={handleToggleStatus} />
                </div>

                <section>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#333' }}>Performance Metrics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                        <PerformanceCard label="Total Deliveries" value={performance.totalDeliveries ?? 0} icon={<FiTruck />} />
                        <PerformanceCard label="On-time Rate" value={`${(performance.onTimeRate * 100).toFixed(0)}%`} icon={<FiClock />} />
                        <PerformanceCard label="Rejections" value={performance.rejections ?? 0} icon={<FiThumbsDown />} />
                        <PerformanceCard label="Average Rating" value={performance.averageRating.toFixed(1)} icon={<FiStar />} />
                    </div>
                </section>

                <section style={{ marginTop: '3rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#333' }}>Account Settings</h3>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ color: '#6B7280', fontSize: '1rem', whiteSpace: 'nowrap' }}>Vehicle Type:</span>
                                {editingVehicle ? (
                                    <select value={newVehicle} onChange={(e) => setNewVehicle(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: 'white', fontSize: '1rem' }}>
                                        <option value="" disabled>Select vehicle</option>
                                        {VEHICLE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', color: '#333' }}>
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