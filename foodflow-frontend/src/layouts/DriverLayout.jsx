// src/layouts/DriverLayout.jsx

import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useWebSocket } from '../hooks/useWebSocket';
import { Bell, X } from 'lucide-react';

export const DriverLayout = () => {
  const notification = useWebSocket();
  const navigate = useNavigate();

  useEffect(() => {
    // ... (logika za proveru tokena ostaje ista)
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      toast.error("You must be logged in to access this page.");
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (notification) {
      console.log("NOTIFICATION RECEIVED IN LAYOUT:", notification);

      toast.custom(
        (t) => (
          <div
            // Osiguravamo da je ceo kontejner vidljiv i iznad drugih elemenata
            className={`
              max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 relative z-50
              ${t.visible ? 'animate-enter' : 'animate-leave'}
            `}
          >
            {/* ... (deo sa ikonom i porukom ostaje isti) */}
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
                    <Bell className="h-6 w-6 text-green-600" />
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New Notification
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {notification.message || 'Imate novu ponudu, proverite dashboard.'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* === PROMENE SU OVDE === */}
            {/* Dugme za zatvaranje */}
            <div className="flex items-center p-2">
              <button
                onClick={() => toast.dismiss(t.id)}
                // Dodajemo z-index i osiguravamo da je dugme iznad
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 relative z-10"
                aria-label="Dismiss"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        ),
        {
          id: `notification-${Date.now()}`,
          duration: 10000,
          position: "top-right",
        }
      );

      window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
    }
  }, [notification]);

  return (
    <div>
      {/* Dodajemo containerClassName da bismo bili sigurni da je kontejner tosta interaktivan */}
      <Toaster containerClassName="pointer-events-none" toastOptions={{
          className: 'pointer-events-auto'
      }} />
      <main>
        <Outlet />
      </main>
    </div>
  );
};