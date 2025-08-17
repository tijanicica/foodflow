// src/layouts/ManagerLayout.jsx (FINALNA ISPRAVNA VERZIJA)

import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useWebSocket } from '../hooks/useWebSocket'; // Koristimo hook
import { Bell, X, CheckCircle, AlertTriangle, Truck, XCircle } from 'lucide-react';

// ... (Pomoćna funkcija getNotificationDetails ostaje ista)

export const ManagerLayout = () => {
  const notification = useWebSocket(); // Pozivamo hook
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      toast.error("You must be logged in to access this page.");
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (notification) {
      console.log("ManagerLayout: Received new notification from hook:", notification);
      
      // Logika za prikazivanje tostera ostaje ista
      // ... (showCustomToast logika ili direktno toast.custom poziv)

      // Šaljemo specifičan događaj za menadžera
      window.dispatchEvent(new CustomEvent('manager-notification', { detail: notification }));
    }
  }, [notification]);

  return (
    <div>
      <Toaster 
        containerClassName="pointer-events-none" 
        toastOptions={{ className: 'pointer-events-auto' }} 
      />
      <main>
        <Outlet />
      </main>
    </div>
  );
};