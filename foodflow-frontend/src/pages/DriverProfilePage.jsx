import React, { useState, useEffect } from 'react'; // Dodan useState
import { useNavigate, Link } from 'react-router-dom';
import { getDriverPerformance, updateDriverVehicle, updateDriverStatus } from '@/services/api';
// Ikonice
import { FiEdit2, FiSave, FiXCircle, FiTruck, FiClock, FiThumbsDown, FiStar } from 'react-icons/fi';
import { BsBicycle } from 'react-icons/bs';
import { AiFillCar } from 'react-icons/ai';
import { FaMotorcycle } from 'react-icons/fa';

const VEHICLE_OPTIONS = [
    { value: 'CAR', label: 'Car', icon: <AiFillCar /> },
    { value: 'MOTORCYCLE', label: 'Motorcycle', icon: <FaMotorcycle /> },
    { value: 'BICYCLE', label: 'Bicycle', icon: <BsBicycle /> },
];

// --- AŽURIRANA KOMPONENTA BEZ 'POINTER' CURSORA ---
const PerformanceCard = ({ label, value, icon }) => {
    const [isHovered, setIsHovered] = useState(false);

    const cardStyle = {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: isHovered ? '0 8px 15px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'all 0.3s ease-in-out',
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        // cursor: 'pointer' // <-- OVU LINIJU UKLONITE
    };

    return (
        <div
            style={cardStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ color: '#8A643B', fontSize: '2rem' }}>{icon}</div>
            <div>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: '500' }}>{label}</p>
                <p style={{ color: '#1F2937', fontSize: '1.75rem', fontWeight: 'bold' }}>{value}</p>
            </div>
        </div>
    );
};

const VehicleIcon = ({ vehicleType }) => {
    const vehicle = VEHICLE_OPTIONS.find(v => v.value === vehicleType);
    if (!vehicle) return null;
    return <span style={{ marginRight: '0.5rem' }}>{vehicle.icon}</span>;
};

const StatusToggle = ({ isOnline, onToggle }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontWeight: '600', fontSize: '1.1rem', color: isOnline ? '#28a745' : '#6B7280' }}>
            {isOnline ? 'Online' : 'Offline'}
        </span>
        <label style={{
            position: 'relative',
            display: 'inline-block',
            width: '60px',
            height: '34px',
            cursor: 'pointer'
        }}>
            <input
                type="checkbox"
                checked={isOnline}
                onChange={onToggle}
                style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: isOnline ? '#28a745' : '#ccc',
                borderRadius: '34px',
                transition: 'background-color 0.4s'
            }}></span>
            <span style={{
                position: 'absolute',
                height: '26px', width: '26px',
                left: isOnline ? '29px' : '5px',
                bottom: '4px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: 'transform 0.4s'
            }}></span>
        </label>
    </div>
);

export function DriverProfilePage() {
    const navigate = useNavigate();
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingVehicle, setEditingVehicle] = useState(false);
    const [newVehicle, setNewVehicle] = useState('');

    // === IZMJENA #1: Funkcija za čitanje inicijalnog statusa iz localStorage ===
    // Pretpostavljamo da ste prilikom logina spremili status u localStorage
    const getInitialStatus = () => {
        const storedStatus = localStorage.getItem('driverStatus');
        return storedStatus === 'ONLINE';
    };

    // === IZMJENA #2: Inicijaliziramo stanje sa vrijednošću iz localStorage ===
    const [isOnline, setIsOnline] = useState(getInitialStatus());

    useEffect(() => {
    async function fetchData() {
        try {
            const data = await getDriverPerformance();
            setPerformance(data);
            setNewVehicle(data.vehicleType || '');
            // VIŠE NE DIRAMO 'isOnline' STANJE OVDJE!
        } catch (err) { // <-- ISPRAVKA JE OVDJE, UKLONJENO '=>'
            setError('Could not load performance data. Please try again later.');
        } finally {
            setLoading(false);
        }
    }
    fetchData();
}, []);

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('driverStatus'); // Brišemo i status
        navigate('/login', { replace: true });
    };

    const handleVehicleSave = async () => { /* ... ostaje isto ... */ };

    const handleToggleStatus = async () => {
        try {
            const newStatus = isOnline ? "OFFLINE" : "ONLINE";
            await updateDriverStatus({ newStatus });
            
            // === IZMJENA #3: Ažuriramo stanje i u localStorage ===
            localStorage.setItem('driverStatus', newStatus);
            
            setIsOnline(prev => !prev);
        } catch (err) {
            alert('Failed to update status. Please try again.');
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
    if (error) return <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>Error: {error}</div>;

    return (
        <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
                        <Link
                            to="/driver"
                            style={{ textDecoration: 'none', color: '#4A4A4A' }}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/driver/profile"
                            style={{ fontWeight: '600', borderBottom: '2px solid #8A643B', textDecoration: 'none', color: '#4A4A4A' }}
                        >
                            My Profile
                        </Link>
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
            <main style={{ padding: '2rem 10rem' }}>
                {/* OVDE DODAJEMO POTKONTEJNER */}
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    backgroundColor: '#FDFDF5',
                    borderRadius: '24px',
                    padding: '2.5rem',
                    boxShadow: '0 10px 35px rgba(210, 180, 140, 0.2)',
                    border: '1px solid #F3EAD9'
                }}>
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
                            <PerformanceCard label="On-time Rate" value={`${((performance.onTimeRate ?? 0) * 100).toFixed(0)}%`} icon={<FiClock />} />
                            <PerformanceCard label="Rejections" value={performance.rejections ?? 0} icon={<FiThumbsDown />} />
                            <PerformanceCard label="Average Rating" value={(performance.averageRating ?? 0).toFixed(1)} icon={<FiStar />} />
                        </div>
                    </section>

                    <section style={{ marginTop: '3rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#333' }}>Account Settings</h3>
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ color: '#6B7280', fontSize: '1rem', whiteSpace: 'nowrap' }}>Vehicle Type:</span>
                                    {editingVehicle ? (
                                        <select
                                            value={newVehicle}
                                            onChange={(e) => setNewVehicle(e.target.value)}
                                            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: 'white', fontSize: '1rem' }}
                                        >
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
                </div>
            </main>
        </div>
    );
}