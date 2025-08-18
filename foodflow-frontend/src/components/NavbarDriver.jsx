import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, LayoutDashboard } from 'lucide-react';

export const NavbarDriver = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navStyle = {
        backgroundColor: '#FFFFFF',
        padding: '1rem 5%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #E5E7EB'
    };
    
    const logoStyle = {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#1F2937',
        textDecoration: 'none'
    };

    const navLinksStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '2rem'
    };

    const linkStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#4B5563',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'color 0.2s',
    };

    return (
        <header style={navStyle}>
            <Link to="/driver/dashboard" style={logoStyle}>
                FoodFlow <span style={{color: '#65A30D'}}>Driver</span>
            </Link>
            <nav style={navLinksStyle}>
                <Link to="/driver/dashboard" style={linkStyle} onMouseEnter={e => e.target.style.color='#1F2937'} onMouseLeave={e => e.target.style.color='#4B5563'}>
                    <LayoutDashboard size={20} /> Dashboard
                </Link>
                <Link to="/driver/profile" style={linkStyle} onMouseEnter={e => e.target.style.color='#1F2937'} onMouseLeave={e => e.target.style.color='#4B5563'}>
                    <User size={20} /> My Profile
                </Link>
                <button onClick={handleLogout} style={{...linkStyle, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#EF4444'}}>
                    <LogOut size={20} /> Logout
                </button>
            </nav>
        </header>
    );
};