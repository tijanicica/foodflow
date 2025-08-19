// FAJL: src/components/modals/RejectOfferModal.jsx

import React, { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';

// --- GLAVNA KOMPONENTA ---
export const RejectOfferModal = ({ isOpen, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    // Efekat koji resetuje stanje kada se modal zatvori
    useEffect(() => {
        if (!isOpen) {
            setReason('');
            setCustomReason('');
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handlePredefinedClick = (predefinedReason) => {
        setReason(predefinedReason);
        setCustomReason('');
    };
    
    const handleConfirm = () => {
        onConfirm(reason || customReason);
    };

    const predefinedReasons = ['Too far', 'Bad weather', 'Vehicle issue', 'Currently busy'];

    return (
        // Overlay (pozadina)
        <div 
            onClick={onClose}
            style={{ 
                position: 'fixed', top: 0, left: 0, 
                width: '100%', height: '100%', 
                backgroundColor: 'rgba(17, 24, 39, 0.6)', // Tamnija, profesionalnija pozadina
                backdropFilter: 'blur(8px)', // Zadržavamo blur za eleganciju
                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                zIndex: 1000,
                opacity: 1, transition: 'opacity 0.2s ease' // Suptilna tranzicija za pojavljivanje
            }}
        >
            {/* Sadržaj Modala */}
            <div 
                onClick={e => e.stopPropagation()}
                style={{ 
                    fontFamily: 'sans-serif', width: '100%', maxWidth: '440px', 
                    padding: '2rem', backgroundColor: 'white', borderRadius: '16px', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
                }}
            >
                {/* Header Modala */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                    <div>
                        <h4 style={{ margin: 0, fontWeight: '600', fontSize: '1.25rem', color: '#111827' }}>
                            Reason for Rejection
                        </h4>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
                            Your feedback is valuable to us.
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', cursor: 'pointer', color: '#6B7280', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiX size={20} />
                    </button>
                </div>
                
                {/* Predefinisani Razlozi */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {predefinedReasons.map(r => (
                        <ReasonButton 
                            key={r}
                            label={r}
                            isSelected={reason === r}
                            onClick={() => handlePredefinedClick(r)}
                        />
                    ))}
                </div>
                
                {/* Custom Razlog Textarea */}
                <textarea 
                    value={customReason}
                    onChange={(e) => {
                        setCustomReason(e.target.value);
                        setReason('');
                    }}
                    placeholder="Or write your reason here..."
                    style={{ 
                        width: '100%', minHeight: '80px', border: '1px solid #D1D5DB', 
                        borderRadius: '8px', padding: '0.75rem 1rem', resize: 'vertical', 
                        boxSizing: 'border-box', background: 'white',
                        fontSize: '0.9rem', color: '#111827',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        outline: 'none'
                    }}
                    onFocus={e => { e.target.style.borderColor = '#8A643B'; e.target.style.boxShadow = '0 0 0 3px rgba(138, 100, 59, 0.2)'; }}
                    onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                />
                
                {/* === HCI POBOLJŠANJE: Dugmad za Akcije === */}
                <div style={{ 
                    display: 'grid', // Koristimo grid za savršeno poravnanje
                    gridTemplateColumns: '1fr 1fr', // Dve kolone jednake širine
                    gap: '1rem', 
                    marginTop: '2rem', 
                    borderTop: '1px solid #F3F4F6', 
                    paddingTop: '1.5rem' 
                }}>
                    <ActionButton label="Cancel" type="secondary" onClick={onClose} />
                    <ActionButton 
                        label="Submit Reason" 
                        type="primary" 
                        onClick={handleConfirm} 
                        disabled={!reason && !customReason} 
                    />
                </div>
            </div>
        </div>
    );
};


// --- NOVE POMOĆNE KOMPONENTE ZA ČISTIJI KOD ---

// Pomoćna komponenta za predefinisane razloge sa hover efektom
const ReasonButton = ({ label, isSelected, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const style = {
        padding: '0.75rem', borderRadius: '8px',
        border: isSelected ? '2px solid #8A643B' : '1px solid #E5E7EB',
        background: isSelected ? '#FFFBEB' : (isHovered ? '#F9FAFB' : 'white'),
        color: isSelected ? '#8A643B' : '#4B5563',
        cursor: 'pointer', fontSize: '0.9rem',
        fontWeight: isSelected ? '600' : '500',
        transition: 'all 0.2s ease',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        boxShadow: isSelected ? '0 2px 4px rgba(138, 100, 59, 0.1)' : 'none',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    };
    
    return (
        <button style={style} onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: isSelected ? '2px solid #8A643B' : '2px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? '#8A643B' : 'transparent' }}>
                {isSelected && <FiCheck size={12} color="white" />}
            </div>
            {label}
        </button>
    );
};

// Pomoćna komponenta za glavnu dugmad sa hover efektom
const ActionButton = ({ label, type, onClick, disabled }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const baseStyle = {
        padding: '0.6rem 1.2rem',
        border: '1px solid transparent',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.2s ease-in-out',
        opacity: disabled ? 0.5 : 1,
        transform: isHovered && !disabled ? 'translateY(-2px)' : 'translateY(0)',
    };
    
    const primaryStyle = {
        ...baseStyle,
        background: isHovered ? '#71502f' : '#8A643B',
        color: 'white',
        boxShadow: isHovered && !disabled ? '0 10px 15px -3px rgba(138, 100, 59, 0.2), 0 4px 6px -2px rgba(138, 100, 59, 0.1)' : 'none',
    };
    
    const secondaryStyle = {
        ...baseStyle,
        background: isHovered ? '#F3F4F6' : 'white',
        color: '#4B5563',
        borderColor: '#D1D5DB',
    };
    
    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            style={type === 'primary' ? primaryStyle : secondaryStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {label}
        </button>
    );
};