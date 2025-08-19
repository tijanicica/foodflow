// FAJL: src/components/charts/DriverCharts.jsx

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

// Stil za kontejner grafikona ostaje isti
const chartSectionStyle = {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
};

// Komponenta sada prima `performance` objekat kao props
export const DriverCharts = ({ performance }) => {
    // Ako nema podataka, ne prikazuj ništa
    if (!performance) return null;

    // 1. Izračunavamo podatke na osnovu onoga što imamo
    const onTimePercentage = Math.round(performance.onTimeRate * 100);
    const latePercentage = 100 - onTimePercentage;

    // 2. Pripremamo podatke u formatu koji `recharts` razume
    const deliveryStatusData = [
        { name: 'On-time Deliveries', value: onTimePercentage },
        { name: 'Late Deliveries', value: latePercentage },
    ];

    const COLORS = ['#10B981', '#FBBF24']; // Zelena za na vreme, žuta za zakašnjele

    return (
        <section style={{ marginTop: '4rem' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '2rem', color: '#333' }}>
                Delivery Analytics
            </h3>
            <div style={chartSectionStyle}>
                <h4 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#333', textAlign: 'center' }}>On-Time Rate Overview</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={deliveryStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80} // Ovo pravi "krofnu" umesto "pite"
                            outerRadius={110}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {deliveryStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        {/* Tekst u centru "krofne" */}
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="2.5rem" fontWeight="bold" fill="#333">
                            {`${onTimePercentage}%`}
                        </text>
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
};