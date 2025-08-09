// Datoteka: src/pages/DriverDashboard.jsx

import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <-- 1. DODAJTE 'Link' OVDJE

export function DriverDashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        navigate('/login', { replace: true });
    };

    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh', color: '#4A4A4A' }}>
            {/* Navigacija */}
            <header style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderBottom: '1px solid #EAEAEA' }}>
                <nav style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>FoodFlow Driver</h1>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        {/* === 2. IZMJENE SU OVDJE === */}
                        <Link to="/driver" style={{ fontWeight: '600', borderBottom: '2px solid #8A643B' }}>Dashboard</Link>
                        <Link to="/driver/profile">My Profile</Link> 
                        {/* ========================== */}
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </nav>
            </header>

            {/* Glavni Sadržaj */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                    
                    {/* Lijeva Kolona */}
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>New Order Opportunities</h2>
                        <div style={{ border: '2px dashed #D1D5DB', borderRadius: '8px', padding: '4rem 1rem', textAlign: 'center', color: '#6B7280' }}>
                            <p>No new orders available.</p>
                        </div>
                    </div>

                    {/* Desna Kolona */}
                    <div style={{ backgroundColor: '#F3EAD9', borderRadius: '8px', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ color: '#6B7280' }}>Map View</p>
                    </div>

                </div>
            </main>
        </div>
    );
}