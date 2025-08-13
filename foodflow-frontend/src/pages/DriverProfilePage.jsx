import React, { useState, useEffect } from 'react'; // Dodan useState
import { useNavigate, Link } from 'react-router-dom';
import { getDriverPerformance, updateDriverVehicle, updateDriverStatus,updateDriverProfile } from '@/services/api';
// Ikonice
import { FiUser,FiEdit2, FiSave, FiXCircle, FiTruck, FiClock, FiThumbsDown, FiStar } from 'react-icons/fi';
import { BsBicycle } from 'react-icons/bs';
import { AiFillCar } from 'react-icons/ai';
import { FaMotorcycle } from 'react-icons/fa';
import toast from 'react-hot-toast';

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
    const navigate = useNavigate();
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingVehicle, setEditingVehicle] = useState(false);
    const [newVehicle, setNewVehicle] = useState('');
        const [isEditingProfile, setIsEditingProfile] = useState(false);
    // ========================

    // Dodajte i state za podatke iz forme, ako ga već nemate
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
    });
    const labelStyle = {
    display: 'block',
    fontWeight: '500',
    marginBottom: '0.5rem',
    color: '#374151'
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    backgroundColor: 'white',
    fontSize: '1rem'
};

// --- REŠENJE JE OVDE ---
const infoTextStyle = {
    margin: '0.5rem 0',
    fontSize: '1.1rem'
};
// -----------------------


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
const [isSaveHovered, setIsSaveHovered] = useState(false);
const [isCancelHovered, setIsCancelHovered] = useState(false);
    

const handleSaveAll = async () => {
    // 1. PROVERA ŠTA JE ZAISTA PROMENJENO
    const isVehicleChanged = newVehicle && newVehicle !== performance.vehicleType;
    
    const isFirstNameChanged = profileData.firstName && profileData.firstName !== performance.firstName;
    const isLastNameChanged = profileData.lastName && profileData.lastName !== performance.lastName;
    const isProfileChanged = isFirstNameChanged || isLastNameChanged;

    // Ako korisnik nije napravio apsolutno nikakvu promenu, samo zatvori formu.
    if (!isVehicleChanged && !isProfileChanged) {
        setIsEditingProfile(false);
        return;
    }
    
    const promiseToast = toast.loading('Saving changes...');

    try {
        // Niz u koji ćemo staviti API pozive koje treba izvršiti
        const apiCalls = [];

        // ===== KLJUČNA ISPRAVKA JE OVDE =====
        // Kreiramo zahtev za profil samo ako ima promena
        if (isProfileChanged) {
            // Kreiramo POTPUNO PRAZAN objekat
            const profileRequestBody = {};
            
            // Dodajemo polje u objekat SAMO AKO je promenjeno
            if (isFirstNameChanged) {
                profileRequestBody.firstName = profileData.firstName;
            }
            if (isLastNameChanged) {
                profileRequestBody.lastName = profileData.lastName;
            }
            
            // Sada je profileRequestBody ili {firstName: '...'}, ili {lastName: '...'}, ili oba.
            // Ponaša se identično kao Postman.
            apiCalls.push(updateDriverProfile(profileRequestBody));
        }

        // Priprema API poziva za vozilo (ostaje isto)
        if (isVehicleChanged) {
            apiCalls.push(updateDriverVehicle({ newVehicleType: newVehicle }));
        }
        // ===================================

        // Izvrši sve pripremljene API pozive paralelno
        await Promise.all(apiCalls);

        // Najsigurniji način da UI bude 100% tačan je da ponovo dohvatimo sve podatke sa servera.
        const freshData = await getDriverPerformance();
        setPerformance(freshData);
        
        setIsEditingProfile(false);
        toast.success('Changes saved successfully!', { id: promiseToast });

    } catch (err) {
        // Prikazivanje greške ostaje isto
        const errorMessage = err.response?.data?.error || "An error occurred. Please try again.";
        toast.error(errorMessage, { id: promiseToast });
    }
};
    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('driverStatus'); // Brišemo i status
        navigate('/login', { replace: true });
    };




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
                    backgroundColor: '#fffff9ff',
                    borderRadius: '24px',
                    padding: '2.5rem',
                    boxShadow: '0 10px 35px rgba(210, 180, 140, 0.2)',
                    border: '1px solid #F3EAD9'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: '#333' }}>Driver Profile & Performance</h2>
                            <p style={{ marginTop: '0.5rem', fontSize: '1.5rem', color: '#6B7280' }}>{performance.firstName} {performance.lastName}</p>
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
    <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        
        {isEditingProfile ? (
            // ======================================================
            // PRIKAZ FORME KADA JE EDITOVANJE UKLJUČENO
            // ======================================================
           <form onSubmit={(e) => { e.preventDefault(); handleSaveAll(); }}>
    {/* 
        NOVI KONTEJNER: On centrira formu, dodaje border i padding.
    */}
    <div style={{
        border: '2px solid #8A643B',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '550px',
        margin: '0 auto', // Ključna linija za centriranje
        backgroundColor: '#FFFDF9'
    }}>

        {/* 
            STILIZOVANI NASLOV
        */}
        <h4 style={{
            textAlign: 'center',
            marginTop: 0,
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #F3EAD9',
            color: '#8A643B',
            fontSize: '1.5rem',
            fontWeight: '600'
        }}>
            Edit Your Information
        </h4>

        {/* Kontejner za input polja */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Polje za Ime */}
            <div>
                <label style={labelStyle}><FiUser /> First Name</label>
                <input 
                    type="text" 
                    value={profileData.firstName} 
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})} 
                    style={inputStyle} 
                />
            </div>

            {/* Polje za Prezime */}
            <div>
                <label style={labelStyle}><FiUser /> Last Name</label>
                <input 
                    type="text" 
                    value={profileData.lastName} 
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})} 
                    style={inputStyle} 
                />
            </div>
            
            {/* Polje za Vozilo */}
            <div>
                {/* Ikonica se dinamički menja u labeli */}
                <label style={labelStyle}>
                    <VehicleIcon vehicleType={newVehicle || performance.vehicleType} /> 
                    Vehicle Type
                </label>
                <select 
                    value={newVehicle} 
                    onChange={(e) => setNewVehicle(e.target.value)} 
                    style={inputStyle}
                >
                    <option value="" disabled>Select vehicle</option>
                    {VEHICLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
        </div>

        {/* Dugmići za akcije - sada su centrirani */}
      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
    
    {/* Cancel Dugme sa ikonicom */}
    <button 
        type="button" 
        onClick={() => setIsEditingProfile(false)} 
        style={buttonStyle('secondary')}
    >
        <FiXCircle /> Cancel
    </button>

    {/* Save Changes Dugme sa ikonicom i novom bojom */}
    <button 
        type="submit" 
        style={buttonStyle('primary')}
    >
        <FiSave /> Save Changes
    </button>
    
</div>
        
    </div> {/* Kraj novog kontejnera sa borderom */}
</form>
        ) : (
            // ======================================================
            // PRIKAZ PODATAKA KADA JE EDITOVANJE ISKLJUČENO
            // ======================================================
            <div>
            {/* Kontejner za kartice sa podacima */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                
                {/* Kartica za Puno Ime */}
                <ProfileInfoItem 
                    icon={<FiUser />} 
                    label="Full Name" 
                    value={`${performance.firstName} ${performance.lastName}`}
                />

                {/* Kartica za Vozilo */}
                <ProfileInfoItem 
                    icon={<VehicleIcon vehicleType={performance.vehicleType} />}
                    label="Vehicle Type"
                    value={
                        performance.vehicleType 
                        ? VEHICLE_OPTIONS.find(v => v.value === performance.vehicleType).label 
                        : 'Not set'
                    }
                />
            </div>

            {/* Edit dugme, sada pozicionirano na kraju */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                 <button
            onClick={() => {
                setIsEditingProfile(true);
                setNewVehicle(performance.vehicleType || '');
                setProfileData({
                    firstName: performance.firstName,
                    lastName: performance.lastName,
                });
            }}
            style={buttonStyle('edit')} // <-- PRIMENJEN NOVI STIL
        >
            <FiEdit2 /> Edit Profile & Settings
        </button>
            </div>
            </div>
        )}
    </div>
</section>
                </div>
            </main>
        </div>
    );
}