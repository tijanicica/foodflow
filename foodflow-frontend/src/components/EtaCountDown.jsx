// FAJL: src/components/EtaCountdown.j
import React, { useState, useEffect } from 'react';
import { differenceInSeconds, intervalToDuration } from 'date-fns';

export const EtaCountdown = ({ eta }) => {
    // Funkcija koja računa razliku u sekundama (može biti negativna)
    const calculateSecondsLeft = () => {
        if (!eta) return 0;
        return differenceInSeconds(new Date(eta), new Date());
    };

    const [secondsLeft, setSecondsLeft] = useState(calculateSecondsLeft);

    useEffect(() => {
        // Tajmer se izvršava svake sekunde da ažurira stanje
        const timer = setInterval(() => {
            setSecondsLeft(calculateSecondsLeft());
        }, 1000);
        
        // Cleanup funkcija
        return () => clearInterval(timer);
    }, [eta]);

    // --- LOGIKA ZA PRIKAZ ---

    // Slučaj 1: Vreme je isteklo, vozač kasni
    if (secondsLeft < 0) {
        // Uzimamo apsolutnu vrednost za prikaz trajanja kašnjenja
        const secondsLate = Math.abs(secondsLeft);
        const durationLate = intervalToDuration({ start: 0, end: secondsLate * 1000 });
        
        // Sastavljamo string za kašnjenje, prikazujući delove samo ako postoje
        const lateString = [
            durationLate.hours > 0 ? `${durationLate.hours} hr` : '',
            durationLate.minutes > 0 ? `${durationLate.minutes} min` : '',
            `${durationLate.seconds} sec`
        ].filter(Boolean).join(' '); // Uklanja prazne elemente i spaja sa razmakom

        return (
            <p style={{ color: '#B91C1C', fontWeight: 'bold', margin: '0.25rem 0', fontSize: '0.9rem' }}>
                (Late by: {lateString})
            </p>
        );
    }

    // Slučaj 2: Još uvek ima vremena
    const duration = intervalToDuration({ start: 0, end: secondsLeft * 1000 });
    
    // Sastavljamo string za preostalo vreme
    const remainingString = [
        duration.hours > 0 ? `${duration.hours} hr` : '',
        duration.minutes > 0 ? `${duration.minutes} min` : '',
        `${duration.seconds} sec`
    ].filter(Boolean).join(' ');

    return (
        <p style={{ color: '#6B7280', margin: '0.25rem 0', fontSize: '0.9rem' }}>
            (approx. {remainingString} remaining)
        </p>
    );
};