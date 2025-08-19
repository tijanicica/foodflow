// FAJL: src/components/EditProfileModal.jsx

import React, { useState, useEffect } from 'react';
import { FiUser, FiSave, FiXCircle } from 'react-icons/fi';
import { AiFillCar } from 'react-icons/ai';
import { FaMotorcycle } from 'react-icons/fa';
import { BsBicycle } from 'react-icons/bs';

// Konstante i pomoćne funkcije ostaju iste
const VEHICLE_OPTIONS = [
    { value: 'CAR', label: 'Car', icon: <AiFillCar /> },
    { value: 'MOTORCYCLE', label: 'Motorcycle', icon: <FaMotorcycle /> },
    { value: 'BICYCLE', label: 'Bicycle', icon: <BsBicycle /> },
];

const VehicleIcon = ({ vehicleType }) => {
    const vehicle = VEHICLE_OPTIONS.find(v => v.value === vehicleType);
    if (!vehicle) return null;
    return <span style={{ marginRight: '0.5rem' }}>{vehicle.icon}</span>;
};

const buttonStyle = (type) => {
    const base = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', border: '2px solid transparent', fontWeight: '600', fontSize: '1rem', minWidth: '180px', transition: 'all 0.2s ease-in-out' }; // <-- Tranzicija je već tu, super!
    if (type === 'primary') return { ...base, backgroundColor: '#8A643B', color: 'white', borderColor: '#8A643B' };
    if (type === 'secondary') return { ...base, backgroundColor: 'transparent', color: '#6c757d', borderColor: '#6c757d' };
    return base;
};

export const EditProfileModal = ({ isOpen, onClose, initialData, onSave }) => {
    const [formData, setFormData] = useState(initialData);

    // === NOVO: State za praćenje hover efekata ===
    const [isPrimaryHovered, setIsPrimaryHovered] = useState(false);
    const [isSecondaryHovered, setIsSecondaryHovered] = useState(false);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    if (!isOpen) return null;

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const labelStyle = { display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' };
    const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: 'white', fontSize: '1rem' };

    // === NOVO: Dinamički stilovi za dugmad ===
    const primaryButtonStyle = {
        ...buttonStyle('primary'),
        backgroundColor: isPrimaryHovered ? '#71502f' : '#8A643B' // Tamnija nijansa na hover
    };

    const secondaryButtonStyle = {
        ...buttonStyle('secondary'),
        backgroundColor: isSecondaryHovered ? '#e5e5e5ff' : 'transparent', // Popunjava se bojom na hover
        color: isSecondaryHovered ? '#6c757d' : '#5c636aff' // Tekst postaje beo na hover
    };

    return (
        <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#FFFDF9', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '550px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <form onSubmit={handleFormSubmit}>
                    <h4 style={{ textAlign: 'center', marginTop: 0, marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #F3EAD9', color: '#8A643B', fontSize: '1.5rem', fontWeight: '600' }}>
                        Edit Your Information
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}><FiUser /> First Name</label>
                            <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}><FiUser /> Last Name</label>
                            <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}><VehicleIcon vehicleType={formData.vehicleType} /> Vehicle Type</label>
                            <select value={formData.vehicleType} onChange={(e) => setFormData({...formData, vehicleType: e.target.value})} style={inputStyle}>
                                <option value="" disabled>Select vehicle</option>
                                {VEHICLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        {/* === NOVO: Dodati onMouseEnter i onMouseLeave događaji === */}
                        <button 
                            type="button" 
                            onClick={onClose} 
                            style={secondaryButtonStyle}
                            onMouseEnter={() => setIsSecondaryHovered(true)}
                            onMouseLeave={() => setIsSecondaryHovered(false)}
                        >
                            <FiXCircle /> Cancel
                        </button>
                        <button 
                            type="submit" 
                            style={primaryButtonStyle}
                            onMouseEnter={() => setIsPrimaryHovered(true)}
                            onMouseLeave={() => setIsPrimaryHovered(false)}
                        >
                            <FiSave /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};