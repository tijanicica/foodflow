import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Bell, X, CheckCircle, Truck, XCircle, Clock } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

// Funkcija koja određuje stil notifikacije (naslov, ikonica, boja)
const getNotificationDetails = (notification) => {
  let details = { title: 'Order Update', Icon: Bell, bgColor: 'bg-blue-100', textColor: 'text-blue-600' };
  
  switch (notification.type) {
    case 'DRIVER_ARRIVING_SOON':
      details = { title: 'Driver Arriving Soon!', Icon: Clock, bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' };
      break;



    // <-- UNAPREĐENO: Slučaj kada stigne generička promena statusa
    case 'ORDER_STATUS_UPDATE':
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
      }
      break;
  }
  return details;
};

export const CustomerLayout = () => {
  const notification = useNotification();
  const navigate = useNavigate();

  // Provera da li je korisnik ulogovan
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      toast.error("You must be logged in to access this page.");
      navigate('/login');
    }
  }, [navigate]);

  // Glavni useEffect koji obrađuje i prikazuje notifikacije
  useEffect(() => {
    if (!notification) return;

    // Lista svih tipova notifikacija koje su relevantne za kupca.
    const customerNotificationTypes = [
      'DRIVER_ARRIVING_SOON', 
      'CUSTOMER_ORDER_UPDATE', 
      'ORDER_STATUS_UPDATE'
    ];
    
    if (!customerNotificationTypes.includes(notification.type)) {
      return;
    }
      
    const { title, Icon, bgColor, textColor } = getNotificationDetails(notification);

    // Zaštita: Ako naslov nije promenjen, verovatno je status koji nas ne zanima.
    if (title === 'Order Update' && (notification.type === 'ORDER_STATUS_UPDATE' || notification.type === 'CUSTOMER_ORDER_UPDATE')) {
      return;
    }

    // Prikazivanje lepe, stilizovane notifikacije
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