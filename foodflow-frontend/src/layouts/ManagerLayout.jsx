import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useNotification } from '../context/NotificationContext';
import { Bell, X, CheckCircle, XCircle, Truck } from 'lucide-react'; // <-- DODALI SMO 'Truck' IKONICU

// Custom function ONLY for the manager, now with English titles
const getNotificationDetails = (notification) => {
  let details = { title: 'New Message', Icon: Bell, bgColor: 'bg-blue-100', textColor: 'text-blue-600' };
  
  switch (notification.type) {
    case 'OFFER_ACCEPTED':
      details = { title: 'Driver Accepted Offer', Icon: CheckCircle, bgColor: 'bg-green-100', textColor: 'text-green-600' };
      break;
    case 'OFFER_REJECTED':
      details = { title: 'Driver Rejected Offer', Icon: XCircle, bgColor: 'bg-red-100', textColor: 'text-red-600' };
      break;
      
    // UNAPREĐENA LOGIKA ZA STATUSE
    case 'ORDER_STATUS_UPDATE':
      switch (notification.status) {
        // <-- DODATO: Slučaj kada vozač preuzme porudžbinu
        case 'PICKED_UP':
          details = { title: 'Order Picked Up', Icon: Truck, bgColor: 'bg-sky-100', textColor: 'text-sky-600' };
          break;
        // <-- DODATO: Slučaj kada vozač dostavi porudžbinu
        case 'DELIVERED':
          details = { title: 'Order Delivered', Icon: CheckCircle, bgColor: 'bg-green-100', textColor: 'text-green-600' };
          break;
        case 'CANCELED':
          details = { title: 'Delivery Canceled by Driver', Icon: XCircle, bgColor: 'bg-red-100', textColor: 'text-red-600' };
          break;
      }
      break;
  }
  return details;
};

export const ManagerLayout = () => {
  const notification = useNotification();

  useEffect(() => {
    if (!notification) return;

    const managerNotificationTypes = ['OFFER_ACCEPTED', 'ORDER_STATUS_UPDATE', 'OFFER_REJECTED'];
    if (!managerNotificationTypes.includes(notification.type)) return;

    // Uklanjamo console.log jer je sve ispravno
    const { title, Icon, bgColor, textColor } = getNotificationDetails(notification);

    // Ako title nije promenjen (npr. status nije bio ni jedan od očekivanih), nemoj prikazati notifikaciju
    if (title === 'New Message' && notification.type === 'ORDER_STATUS_UPDATE') {
      return;
    }

    toast.custom(
      (t) => (
        <div className={`max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5"><span className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${bgColor}`}><Icon className={`h-6 w-6 ${textColor}`} /></span></div>
              <div className="ml-3 flex-1"><p className="text-sm font-medium text-gray-900">{title}</p><p className="mt-1 text-sm text-gray-500">{notification.message}</p></div>
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