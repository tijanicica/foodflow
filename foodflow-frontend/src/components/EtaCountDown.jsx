// FAJL: src/components/EtaCountdown.jsx

import React, { useState, useEffect } from 'react';
import { differenceInSeconds, intervalToDuration } from 'date-fns';

export const EtaCountdown = ({ eta }) => {
    // Funkcija koja sada može da vrati i NEGATIVAN broj sekundi
    const calculateSecondsLeft = () => {
        if (!eta) return 0;
        // Uklonili smo Math.max(0, ...) da bismo dozvolili negativne vrednosti
        return differenceInSeconds(new Date(eta), new Date());
    };

    const [secondsLeft, setSecondsLeft] = useState(calculateSecondsLeft);

    useEffect(() => {
        // Tajmer se izvršava svake sekunde i ponovo poziva kalkulaciju
        const timer = setInterval(() => {
            setSecondsLeft(calculateSecondsLeft());
        }, 1000);
        
        // Cleanup funkcija
        return () => clearInterval(timer);
    }, [eta]); // Ponovo pokreni ceo proces ako se 'eta' prop promeni

    
    // --- Logika za prikaz ---

    // Slučaj 1: Vreme je isteklo, vozač kasni (secondsLeft je negativan broj)
    if (secondsLeft < 0) {
        // Pretvaramo negativne sekunde u apsolutnu (pozitivnu) vrednost za prikaz
        const secondsLate = Math.abs(secondsLeft);
        const durationLate = intervalToDuration({ start: 0, end: secondsLate * 1000 });
        
        return (
            <p style={{ color: '#B91C1C', fontWeight: 'bold', margin: '0.25rem 0', fontSize: '0.9rem' }}>
                (Late by: {durationLate.minutes > 0 ? `${durationLate.minutes} min ` : ''}{durationLate.seconds} sec)
            </p>
        );
    }

    // Slučaj 2: Još uvek ima vremena (secondsLeft je pozitivan broj)
    const duration = intervalToDuration({ start: 0, end: secondsLeft * 1000 });
    
    return (
        <p style={{ color: '#6B7280', margin: '0.25rem 0', fontSize: '0.9rem' }}>
            (approx. {duration.minutes} min {duration.seconds} sec remaining)
        </p>
    );
};