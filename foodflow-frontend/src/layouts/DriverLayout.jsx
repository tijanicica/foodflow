import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useNotification } from '../context/NotificationContext';
import { Bell, X } from 'lucide-react';

// Custom function ONLY for the driver, now with English titles
const getNotificationDetails = (notification) => {
  let details = { title: 'New Message', Icon: Bell, bgColor: 'bg-gray-100', textColor: 'text-gray-600' };

  switch (notification.type) {
    case 'ORDER_READY_FOR_PICKUP':
      details = { title: 'Order Ready for Pickup', Icon: Bell, bgColor: 'bg-green-100', textColor: 'text-green-600' };
      break;
    
    // <-- ISPRAVLJENO: Tip se sada poklapa sa onim što backend šalje
    case 'NEW_ORDER_OFFER':
      details = { title: 'New Delivery Offer', Icon: Bell, bgColor: 'bg-blue-100', textColor: 'text-blue-600' };
      break;
  }
  return details;
};

export const DriverLayout = () => {
  const notification = useNotification();

  useEffect(() => {
    if (!notification) return;

    // <-- ISPRAVLJENO: Dodajemo ispravan tip na listu dozvoljenih
    const driverNotificationTypes = ['ORDER_READY_FOR_PICKUP', 'NEW_ORDER_OFFER'];
    if (!driverNotificationTypes.includes(notification.type)) return;

    const { title, Icon, bgColor, textColor } = getNotificationDetails(notification);

    // Zaštita da se ne prikaže generička poruka
    if (title === 'New Message') return;

    toast.custom(
      (t) => (
        <div className={`max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5"><span className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${bgColor}`}><Icon className={`h-6 w-6 ${textColor}`} /></span></div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                {notification.message && (
                  <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center p-2"><button onClick={() => toast.dismiss(t.id)} className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"><X className="h-5 w-5 text-gray-500" /></button></div>
        </div>
      ),
      { id: `notification-${Date.now()}`, duration: 10000, position: "top-right" }
    );
  }, [notification]);

  return (
    <div>
      <Toaster />
      <main><Outlet /></main>
    </div>
  );
};