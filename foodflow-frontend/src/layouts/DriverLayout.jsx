// src/layouts/DriverLayout.jsx

import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWebSocket } from '../hooks/useWebSocket';

/**
 * DriverLayout je "omotač" za sve stranice koje su dostupne vozaču.
 * On je uvek aktivan dok je vozač na bilo kojoj svojoj stranici.
 * Njegovi zadaci su:
 * 1. Održavanje WebSocket konekcije aktivnom preko 'useWebSocket' hook-a.
 * 2. Prikazivanje "toster" notifikacija koje stignu.
 * 3. Obaveštavanje ostatka aplikacije o novoj notifikaciji putem custom događaja.
 * 4. Prikazivanje trenutne stranice (npr. Dashboard, Profile) unutar <Outlet />.
 */
export const DriverLayout = () => {
  // 1. Pozivamo hook koji se brine o celoj WebSocket logici
  const notification = useWebSocket();
  const navigate = useNavigate();

  // 2. Sigurnosna provera: Ako korisnik nije ulogovan, vrati ga na login stranicu.
  // Ovaj useEffect se izvršava samo jednom, kada se layout prvi put učita.
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      toast.error("You must be logged in to access this page.");
      navigate('/login');
    }
  }, [navigate]); // Zavisnost je 'navigate' da bi se izbeglo upozorenje

  // 3. Reakcija na novu notifikaciju
  // Ovaj useEffect se izvršava SVAKI PUT kada stigne nova notifikacija,
  // jer se 'notification' objekat promeni.
  useEffect(() => {
    // Proveravamo da li notifikacija postoji (da se ne bi aktiviralo pri prvom renderu)
    if (notification) {
      // Prikazujemo toster poruku
      console.log("NOTIFICATION RECEIVED IN LAYOUT:", notification);
      toast.success(notification.message || 'You have a new update!', {
        icon: '🚚',
        duration: 8000,
        position: "bottom-right",
      });

      // Obaveštavamo druge komponente o novom događaju
      // Ovo omogućava npr. DriverDashboard-u da osveži listu ponuda
      window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
    }
  }, [notification]); // Zavisnost je 'notification'

  // 4. Renderovanje
  // Komponenta renderuje samo 'main' omotač i <Outlet />,
  // gde će react-router prikazati odgovarajuću stranicu.
  return (
    <div>
      {/* 
        Ovde je idealno mesto da se doda navigaciona traka specifična za vozača,
        jer bi se tako videla na svim njegovim stranicama.
        Npr: <DriverNavbar />
      */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};