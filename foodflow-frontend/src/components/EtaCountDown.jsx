// FAJL: src/components/EtaCountdown.jsx

import React, { useState, useEffect } from 'react';
import { differenceInSeconds, intervalToDuration } from 'date-fns';

export const EtaCountdown = ({ eta }) => {
    const calculateRemaining = () => {
        if (!eta) return 0;
        const now = new Date();
        const etaDate = new Date(eta);
        return Math.max(0, differenceInSeconds(etaDate, now));
    };

    const [remainingSeconds, setRemainingSeconds] = useState(calculateRemaining);

    useEffect(() => {
        const timer = setInterval(() => {
            setRemainingSeconds(calculateRemaining());
        }, 1000);
        return () => clearInterval(timer);
    }, [eta]);

    if (remainingSeconds <= 0) {
        return <p style={{ color: '#6B7280', margin: '0.25rem 0', fontSize: '0.9rem' }}>(Arrived)</p>;
    }

    const duration = intervalToDuration({ start: 0, end: remainingSeconds * 1000 });

    return (
        <p style={{ color: '#6B7280', margin: '0.25rem 0', fontSize: '0.9rem' }}>
            (approx. {duration.minutes > 0 ? `${duration.minutes} min ` : ''}
            {duration.seconds} sec remaining)
        </p>
    );
};