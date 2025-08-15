// Datoteka: src/components/AppLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom'; // Važan import
import { MiniCart } from './MiniCart';

// Ovaj layout obmotava svaku stranicu i pruža MiniCart
export const AppLayout = () => {
    return (
        <>
            <Outlet /> {/* Ovde će React Router renderovati trenutnu stranicu (npr. HomePage) */}
            <MiniCart />
        </>
    );
};