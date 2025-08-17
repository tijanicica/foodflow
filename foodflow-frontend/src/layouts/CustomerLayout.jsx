// src/layouts/CustomerLayout.jsx

import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useWebSocket } from '../hooks/useWebSocket';
// Ikonice za različite tipove notifikacija
import { Bell, X, CheckCircle, Truck, XCircle, Clock } from 'lucide-react';

/**
 * Pomoćna funkcija koja određuje stil i sadržaj notifikacije
 * na osnovu tipa koji stiže sa servera.
 */
const getNotificationDetails = (notification) => {
  // Podrazumevane vrednosti
  let details = {
    title: 'Order Update',
    Icon: Bell,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  };

  switch (notification.type) {
    case 'DRIVER_ARRIVING_SOON':
      details = {
        title: 'Driver Arriving Soon!',
        Icon: Clock,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-600',
      };
      break;
    case 'CUSTOMER_ORDER_UPDATE':
      switch (notification.status) {
        case 'PICKED_UP':
          details = { title: 'Order Picked Up', Icon: Truck, bgColor: 'bg-sky-100', textColor: 'text-sky-600' };
          break;
        case 'DELIVERED':
          details = { title: 'Order Delivered', Icon: CheckCircle, bgColor: 'bg-green-100', textColor: 'text-green-600' };
          break;
        case 'CANCELED':
          details = { title: 'Delivery Canceled', Icon: XCircle, bgColor: 'bg-red-100', textColor: 'text-red-600' };
          break;
        default:
          details.title = 'Order Status Updated';
      }
      break;
  }
  return details;
};



export const CustomerLayout = () => {
  const notification = useWebSocket();
  const navigate = useNavigate();

  // Provera da li je korisnik ulogovan
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      toast.error("You must be logged in to access this page.");
      navigate('/login');
    }
  }, [navigate]);

  // useEffect koji reaguje na nove notifikacije
  useEffect(() => {
    if (notification) {
      console.log("CUSTOMER LAYOUT RECEIVED NOTIFICATION:", notification);

      const { title, Icon, bgColor, textColor } = getNotificationDetails(notification);

      toast.custom(
        (t) => (
          <div className={`max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 relative z-50 ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${bgColor}`}>
                    <Icon className={`h-6 w-6 ${textColor}`} />
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{title}</p>
                  <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center p-2">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 relative z-10"
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

      // Šaljemo specifičan događaj za kupca, da druge komponente mogu da reaguju
      window.dispatchEvent(new CustomEvent('customer-notification', { detail: notification }));
    }
  }, [notification]);

  return (
    <div>
      <Toaster />
      <main>
        {/* Ovde će se renderovati sve stranice za kupca */}
        <Outlet />
      </main>
    </div>
  );
};