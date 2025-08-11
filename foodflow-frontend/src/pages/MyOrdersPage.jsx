// U novom fajlu: src/pages/MyOrdersPage.jsx

import React from 'react';
import { Navbar } from '@/components/Navbar'; // Pretpostavljam da imate Navbar komponentu

export const MyOrdersPage = () => {
    return (
        <div className="w-full min-h-screen bg-[#F9F5EC]">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-[#4A4A4A] mb-8">My Orders</h1>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <p className="text-center text-gray-500">
                        Your previous orders will be displayed here.
                    </p>
                    {/* Ovde ćete kasnije dodati logiku za prikaz liste porudžbina */}
                </div>
            </main>
        </div>
    );
};