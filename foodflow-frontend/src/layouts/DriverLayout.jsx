// src/layouts/DriverLayout.jsx

import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWebSocket } from '../hooks/useWebSocket'; // Uvozimo naš hook
    



/**
 * DriverLayout je "omotač" za sve stranice koje su dostupne vozaču.
 * Njegov zadatak NIJE da prikazuje neku stranicu, već da:
 * 1. Održava WebSocket konekciju aktivnom sve vreme.
 * 2. Sluša za nove notifikacije i prikazuje ih u "tosteru".
 * 3. Renderuje trenutnu stranicu na kojoj se vozač nalazi unutar <Outlet />.
 */
export const DriverLayout = () => {
  // 1. POZIVAMO HOOK
  // Ova jedna linija pokreće celu mašineriju: čita token, povezuje se
  // na WebSocket i daje nam poslednju primljenu notifikaciju.
  const notification = useWebSocket();
  const navigate = useNavigate();

  // 2. SIGURNOSNA PROVERA (Opciono, ali jako preporučljivo)
  // Ovaj useEffect se pokreće samo jednom kada se layout učita.
  // Proverava da li vozač uopšte ima token. Ako nema, vraća ga na login.
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      toast.error("You must be logged in to access this page.");
      navigate('/login');
    }
  }, [navigate]); // navigate je zavisnost

  // 3. PRIKAZIVANJE NOTIFIKACIJE
  // Ovaj useEffect se pokreće SVAKI PUT kada stigne nova notifikacija.
  useEffect(() => {
    // Proveravamo da li notifikacija postoji (da ne bi iskočio toster pri učitavanju)
    if (notification) {
      // Prikazujemo toster poruku sa sadržajem koji je stigao sa backenda
      toast.success(notification.message || 'You have a new update!', {
        icon: '🚚',       // Lepa ikonica za vozača
        duration: 8000,   // Neka notifikacija stoji 8 sekundi da se stigne pročitati
        position: "top-right", // Pojavljuje se u gornjem desnom uglu
      });
    }
  }, [notification]); // notifikacija je zavisnost

  // 4. RENDER
  return (
    <div>
      {/* 
        Ovde kasnije možete dodati navigacionu traku samo za vozača.
        Npr: <DriverNavbar /> 
        Ona bi se onda videla na svim vozačkim stranicama.
      */}
      <main>
        {/* 
          <Outlet /> je magična komponenta iz 'react-router-dom'.
          Ona služi kao "ram za sliku". Ovde će se automatski prikazati
          ona komponenta koja odgovara trenutnoj ruti (/driver, /driver/profile, itd.)
        */}
        <Outlet />
      </main>
    </div>
  );
};