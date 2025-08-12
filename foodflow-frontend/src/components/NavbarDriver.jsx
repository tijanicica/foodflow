// FAJL: src/components/NavbarDriver.jsx

import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export const NavbarDriver = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook za dobijanje trenutne putanje

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        // Ovdje možete obrisati i ostale podatke ako je potrebno
        // localStorage.removeItem('driverStatus');
        navigate('/login', { replace: true });
    };

    // Funkcija za provjeru da li je link aktivan
    const isActive = (path) => location.pathname === path;

    return (
        <header style={{ backgroundColor: 'white', borderBottom: '1px solid #EAEAEA', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <nav style={{
                maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>FoodFlow Driver</h1>
                
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link
                        to="/driver"
                        style={{
                            fontWeight: isActive('/driver') ? 'bold' : 'normal',
                            borderBottom: isActive('/driver') ? '2px solid #8A643B' : 'none',
                            textDecoration: 'none',
                            color: '#4A4A4A',
                            paddingBottom: '4px' // Dodajemo malo prostora za donju liniju
                        }}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/driver/profile"
                        style={{
                            fontWeight: isActive('/driver/profile') ? 'bold' : 'normal',
                            borderBottom: isActive('/driver/profile') ? '2px solid #8A643B' : 'none',
                            textDecoration: 'none',
                            color: '#4A4A4A',
                            paddingBottom: '4px'
                        }}
                    >
                        My Profile
                    </Link>
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: '#8A643B', border: 'none', color: 'white',
                            padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </nav>
        </header>
    );
};