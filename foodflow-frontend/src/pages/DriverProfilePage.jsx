import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getDriverPerformance, updateDriverVehicle, updateDriverStatus } from '@/services/api';

const VEHICLE_OPTIONS = [
    { value: 'CAR', label: 'Car' },
    { value: 'MOTORCYCLE', label: 'Motorcycle' },
    { value: 'BICYCLE', label: 'Bicycle' },
];

const PerformanceCard = ({ label, value }) => (
    <div style={{
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>{label}</p>
        <p style={{
            color: '#1F2937',
            fontSize: '2rem',
            fontWeight: 'bold',
            marginTop: '0.5rem'
        }}>{value}</p>
    </div>
);

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
            console.error("Error updating vehicle:", err);
        }
    };

    const handleToggleStatus = async () => {
        try {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                alert('Niste prijavljeni. Molimo prijavite se.');
                navigate('/login', { replace: true });
                return;
            }

            // Novi status kao string iz enuma
            const newStatus = isOnline ? "OFFLINE" : "ONLINE";

            await updateDriverStatus({ newStatus });  // šalje objekat sa poljem newStatus
            setIsOnline(prev => !prev);
        } catch (err) {
            alert('Neuspešno ažuriranje statusa. Pokušajte ponovo.');
            console.error("Error updating status:", err);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading profile...</div>;
    if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

    return (
        <div style={{
            fontFamily: 'sans-serif',
            backgroundColor: '#FFFBEB',
            minHeight: '100vh',
            color: '#4A4A4A'
        }}>
            {/* Navigacija */}
            <header style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderBottom: '1px solid #EAEAEA'
            }}>
                <nav style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>FoodFlow Driver</h1>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <Link to="/driver" style={{ textDecoration: 'none', color: '#4A4A4A' }}>Dashboard</Link>
                        <Link to="/driver/profile" style={{
                            fontWeight: '600',
                            borderBottom: '2px solid #8A643B',
                            textDecoration: 'none',
                            color: '#8A643B'
                        }}>My Profile</Link>
                        <button
                            onClick={handleLogout}
                            style={{
                                backgroundColor: '#8A643B',
                                border: 'none',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </header>

            {/* Glavni Sadržaj */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                    My Profile & Performance
                </h2>

                <p style={{ marginTop: '0.5rem', fontSize: '1.2rem', fontWeight: '500' }}>
                    {performance.firstName} {performance.lastName}
                </p>

                {/* Sekcija sa Performance karticama i toggle dugmetom */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '2rem',
                    gap: '2rem',
                    flexWrap: 'wrap'
                }}>
                    {/* Performance kartice */}
                    <div style={{
                        flex: '1 1 65%',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        <PerformanceCard label="Total Deliveries" value={performance.totalDeliveries ?? 0} />
                        <PerformanceCard label="On-time Rate" value={`${((performance.onTimeRate ?? 0) * 100).toFixed(0)}%`} />
                        <PerformanceCard label="Rejections" value={performance.rejections ?? 0} />
                        <PerformanceCard label="Average Rating" value={(performance.averageRating ?? 0).toFixed(1)} />
                    </div>

                    {/* Toggle online/offline status */}
                    <div style={{
                        minWidth: '180px',
                        backgroundColor: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontWeight: '600',
                        color: isOnline ? 'green' : '#6B7280',
                        userSelect: 'none'
                    }}>
                        <span style={{ marginBottom: '0.75rem' }}>{isOnline ? 'Online' : 'Offline'}</span>
                        <label style={{
                            position: 'relative',
                            display: 'inline-block',
                            width: '50px',
                            height: '24px',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={isOnline}
                                onChange={handleToggleStatus}
                                style={{ display: 'none' }}
                            />
                            <span style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: isOnline ? 'green' : '#ccc',
                                borderRadius: '24px',
                                transition: '.4s'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    height: '18px',
                                    width: '18px',
                                    left: isOnline ? '26px' : '4px',
                                    bottom: '3px',
                                    backgroundColor: 'white',
                                    borderRadius: '50%',
                                    transition: '.4s'
                                }}></span>
                            </span>
                        </label>
                    </div>
                </div>

                {/* Account details */}
                <section style={{ marginTop: '3rem' }}>
                    <h3 style={{ fontWeight: '600', fontSize: '1.25rem' }}>Account Details</h3>
                    <div style={{
                        marginTop: '1rem',
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <span style={{ color: '#6B7280' }}>Vehicle:</span>
                                {editingVehicle ? (
                                    <select
                                        value={newVehicle}
                                        onChange={(e) => setNewVehicle(e.target.value)}
                                        style={{
                                            marginLeft: '0.5rem',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '6px',
                                            border: '1px solid #ccc',
                                            backgroundColor: '#f9f9f9',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        <option value="" disabled>Select vehicle</option>
                                        {VEHICLE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span style={{ fontWeight: 'bold', marginLeft: '0.5rem' }}>
                                        {performance.vehicleType || 'Not set'}
                                    </span>
                                )}
                            </div>
                            <div>
                                {editingVehicle ? (
                                    <>
                                        <button
                                            onClick={handleVehicleSave}
                                            style={{
                                                marginRight: '0.5rem',
                                                backgroundColor: '#8A643B',
                                                color: 'white',
                                                padding: '0.3rem 0.8rem',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingVehicle(false);
                                                setNewVehicle(performance.vehicleType || '');
                                            }}
                                            style={{
                                                backgroundColor: '#ccc',
                                                padding: '0.3rem 0.8rem',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setEditingVehicle(true)}
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            color: '#8A643B',
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Edit
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
