import React, { useState, useEffect } from 'react'; // Dodan useState
import { useNavigate, Link } from 'react-router-dom';
import { getDriverPerformance, updateDriverVehicle,getDriverStatus, updateDriverStatus,updateDriverProfile } from '@/services/api';
// Ikonice
import { FiUser,FiEdit2, FiSave, FiXCircle, FiTruck, FiClock, FiThumbsDown, FiStar } from 'react-icons/fi';
import { BsBicycle } from 'react-icons/bs';
import { AiFillCar } from 'react-icons/ai';
import { FaMotorcycle } from 'react-icons/fa';
import { DriverFooter } from '@/components/DriverFooter';
import { NavbarDriver } from '@/components/NavbarDriver';
import toast from 'react-hot-toast';
import { EditProfileModal } from '@/components/modals/EditDriverProfileModal';

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

// Na dnu vašeg fajla (posle glavne komponente)

// --- POJEDNOSTAVLJENA FUNKCIJA ZA STILIZOVANJE DUGMIĆA ---
const buttonStyle = (type) => {
    // Osnovni stilovi koji važe za sva dugmad
    const base = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        border: '2px solid transparent', // Važno za "ghost" stil
        fontWeight: '600',
        fontSize: '1rem',
        minWidth: '180px', // Osigurava istu veličinu
        transition: 'all 0.2s ease-in-out',
    };

    // Stilovi za primarno dugme (Save) - Brend boja
    if (type === 'primary') return {
        ...base,
        backgroundColor: '#8A643B',
        color: 'white',
        borderColor: '#8A643B',
    };

    // Stilovi za sekundarno dugme (Cancel) - "Ghost" stil
    if (type === 'secondary') return {
        ...base,
        backgroundColor: 'transparent',
        color: '#6c757d',
        borderColor: '#6c757d', // Vidljiv sivi border
    };
    
    // Stilovi za "Edit" dugme (isto kao primarno)
    if (type === 'edit') return {
        ...base,
        minWidth: 'auto', // Edit dugme ne mora biti iste širine
        backgroundColor: '#8A643B',
        color: 'white',
        borderColor: '#8A643B',
    };

    return base;
};

const VehicleIcon = ({ vehicleType }) => {
    const vehicle = VEHICLE_OPTIONS.find(v => v.value === vehicleType);
    if (!vehicle) return null;
    return <span style={{ marginRight: '0.5rem' }}>{vehicle.icon}</span>;
};
const ProfileInfoItem = ({ icon, label, value }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center', // Ovaj red poravnava "icon div" i "text div"
        gap: '1.5rem',
        backgroundColor: '#ffffffff',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        border: '2px solid #8A643B'
    }}>
        {/* --- IZMENA JE NA OVOJ LINIJI --- */}
        <div style={{ 
            color: '#8A643B', 
            fontSize: '2rem', 
            display: 'flex', 
            alignItems: 'center' // Ovaj red poravnava samu ikonicu UNUTAR ovog diva
        }}>
            {icon}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem', fontWeight: '500' }}>{label}</p>
            <p style={{ margin: 0, color: '#1F2937', fontSize: '1.25rem', fontWeight: 'bold' }}>{value}</p>
        </div>
    </div>
);

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
   const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // Ovo je jedini state za kontrolu UI
    const getInitialStatus = () => localStorage.getItem('driverStatus') === 'ONLINE';
    const [isOnline, setIsOnline] = useState(getInitialStatus);

    // useEffect ostaje skoro isti, samo uklanjamo postavljanje state-ova koji više ne postoje
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [performanceData, statusData] = await Promise.all([
                    getDriverPerformance(),
                    getDriverStatus()
                ]);

                setPerformance(performanceData);
                
                const serverStatusIsOnline = statusData.status === 'ONLINE';
                setIsOnline(serverStatusIsOnline);
                localStorage.setItem('driverStatus', statusData.status);
            } catch (err) {
                console.error("Failed to fetch driver data:", err);
                setError('Could not load profile data. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    
    // === 2. POJEDNOSTAVLJENA HANDLER FUNKCIJA ===
    // Sada se zove `handleSaveChanges` i prima podatke od modala
    const handleSaveChanges = async (updatedData) => {
        const { firstName, lastName, vehicleType } = updatedData;
        
        // Provera šta se zaista promenilo
        const isVehicleChanged = vehicleType && vehicleType !== performance.vehicleType;
        const isFirstNameChanged = firstName && firstName !== performance.firstName;
        const isLastNameChanged = lastName && lastName !== performance.lastName;
        const isProfileChanged = isFirstNameChanged || isLastNameChanged;

        if (!isVehicleChanged && !isProfileChanged) {
            setIsModalOpen(false); // Samo zatvori modal ako nema promena
            return;
        }
        
        const promiseToast = toast.loading('Saving changes...');
        try {
            const apiCalls = [];
            if (isProfileChanged) {
                const profileRequestBody = {};
                if (isFirstNameChanged) profileRequestBody.firstName = firstName;
                if (isLastNameChanged) profileRequestBody.lastName = lastName;
                apiCalls.push(updateDriverProfile(profileRequestBody));
            }
            if (isVehicleChanged) {
                apiCalls.push(updateDriverVehicle({ newVehicleType: vehicleType }));
            }
            
            await Promise.all(apiCalls);
            
            // Osveži podatke na stranici
            const freshData = await getDriverPerformance();
            setPerformance(freshData);
            
            setIsModalOpen(false); // Zatvori modal nakon uspešnog čuvanja
            toast.success('Changes saved successfully!', { id: promiseToast });

        } catch (err) {
            const errorMessage = err.response?.data?.error || "An error occurred.";
            toast.error(errorMessage, { id: promiseToast });
        }
    };
    
    // `handleToggleStatus` ostaje isti
    const handleToggleStatus = async () => {
        try {
            const newStatus = isOnline ? "OFFLINE" : "ONLINE";
            await updateDriverStatus({ newStatus });
            localStorage.setItem('driverStatus', newStatus);
            setIsOnline(prev => !prev);
        } catch (err) {
            toast.error('Failed to update status. Please try again.');
        }
    };

        if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFFBEB' }}>
            <NavbarDriver />
            <div style={{ padding: '2rem', textAlign: 'center', flex: 1, fontSize: '1.2rem' }}>Loading profile...</div>
            <DriverFooter />
        </div>
    );

    if (error) return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFFBEB' }}>
            <NavbarDriver />
            <div style={{ padding: '2rem', color: 'red', textAlign: 'center', flex: 1, fontSize: '1.2rem' }}>Error: {error}</div>
            <DriverFooter />
        </div>
    );
    

    return (
        <div style={{
            fontFamily: 'sans-serif',
            backgroundColor: '#FFFBEB',
            minHeight: '100vh',
            color: '#4A4A4A',
            display: 'flex',        // <-- 1. DODATO: Omogućava flexbox layout
            flexDirection: 'column' // <-- 2. DODATO: Ređa elemente jedan ispod drugog
        }}>
            
            {/* 3. DODATO: Komponenta za navigaciju */}
            <NavbarDriver />

            {/* Glavni Sadržaj */}
           <main style={{ padding: '2rem 10rem', flex: 1 }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    backgroundColor: '#fffff9ff',
                    borderRadius: '24px',
                    padding: '2.5rem',
                    boxShadow: '0 10px 35px rgba(210, 180, 140, 0.2)',
                    border: '1px solid #F3EAD9'
                }}>
                    
                    {/* Ovaj deo ostaje isti - Prikaz naslova i Online/Offline statusa */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: '#333' }}>Driver Profile & Performance</h2>
                            <p style={{ marginTop: '0.5rem', fontSize: '1.5rem', color: '#6B7280' }}>{performance.firstName} {performance.lastName}</p>
                        </div>
                        <StatusToggle isOnline={isOnline} onToggle={handleToggleStatus} />
                    </div>

                    {/* Ovaj deo ostaje isti - Prikaz kartica sa performansama */}
                    <section>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#333' }}>Performance Metrics</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                            <PerformanceCard label="Total Deliveries" value={performance.totalDeliveries ?? 0} icon={<FiTruck />} />
                            <PerformanceCard label="On-time Rate" value={`${((performance.onTimeRate ?? 0) * 100).toFixed(0)}%`} icon={<FiClock />} />
                            <PerformanceCard label="Rejections" value={performance.rejections ?? 0} icon={<FiThumbsDown />} />
                            <PerformanceCard label="Average Rating" value={(performance.averageRating ?? 0).toFixed(1)} icon={<FiStar />} />
                        </div>
                    </section>

                    {/* === GLAVNA IZMENA JE OVDE === */}
                    {/* Uklonjena je cela `isEditingProfile ? (...) : (...)` logika. */}
                    <section style={{ marginTop: '3rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#333' }}>Account Settings</h3>
                        <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            
                            {/* Sada se UVEK prikazuju samo podaci */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                <ProfileInfoItem 
                                    icon={<FiUser />} 
                                    label="Full Name" 
                                    value={`${performance.firstName} ${performance.lastName}`}
                                />
                                <ProfileInfoItem 
                                    icon={<VehicleIcon vehicleType={performance.vehicleType} />} 
                                    label="Vehicle Type" 
                                    value={performance.vehicleType ? VEHICLE_OPTIONS.find(v => v.value === performance.vehicleType).label : 'Not set'} 
                                />
                            </div>

                            {/* Edit dugme sada samo otvara modal */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                <button 
                                    onClick={() => setIsModalOpen(true)} // <-- Jedina akcija
                                    style={buttonStyle('edit')}
                                >
                                    <FiEdit2 /> Edit Profile & Settings
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>


            {/* === DODAT JE POZIV ZA MODAL OVDE (IZVAN MAINA) === */}
            {/* Modal je "nevidljiv" dok se `isModalOpen` ne postavi na `true` */}
            {performance && (
                <EditProfileModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveChanges}
                    initialData={{
                        firstName: performance.firstName,
                        lastName: performance.lastName,
                        vehicleType: performance.vehicleType || '',
                    }}
                />
            )}
            {/* 5. DODATO: Komponenta za footer */}
            <DriverFooter />
        </div>
    );
}