import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom"; // Uvezi ruter
import './index.css';
import { CartProvider } from './context/CartContext'; // Importuj
import { Toaster } from 'react-hot-toast'; // Importuj
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'; // <-- DODAJTE OVU LINIJU
import 'leaflet/dist/leaflet.css';




// Uvezi sve tvoje stranice
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { MenuPage } from './pages/MenuPage.jsx';
import { DriverDashboard } from './pages/DriverDashboard.jsx';
import { CheckoutPage } from './pages/CheckoutPage.jsx';
import { MyOrdersPage } from './pages/MyOrdersPage.jsx';
import { DriverProfilePage } from './pages/DriverProfilePage.jsx'; 
import { OrderDetailPage } from './pages/OrderDetailPage.jsx';
import { ViewOrderPage } from './pages/ViewOrderPage'; 
import { TrackOrderPage } from './pages/TrackOrderPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { MyProfilePage } from './pages/MyProfilePage.jsx'; 



// Ovde ćeš kasnije dodavati i druge stranice (npr. DashboardPage)

// Kreiraj ruter i definiši putanje (rute)
const router = createBrowserRouter([
  {
    path: "/", // Početna stranica (obično login)
    element: <LoginPage />,
  },
  {
    path: "/login", // Putanja za login stranicu
    element: <LoginPage />,
  },
  {
    path: "/register", // Putanja za register stranicu
    element: <RegisterPage />,
  },
  {
    path: "/home",
    element: <HomePage />,
  },

  {
    path: "/restaurant/:restaurantId", // Dvotačka označava dinamički segment
    element: <MenuPage />,
  },
   {
    path: "/checkout",
    element: <CheckoutPage />,
  },
  {
    path: "/orders",
    element: <MyOrdersPage />,
  },
      {
    path: "/order/:orderId", // Dinamička ruta sa ID-jem porudžbine
    element: <OrderDetailPage />,
  },

  {
  path: "/driver",
  element: <DriverDashboard />,
  },
 
  {
    path: "/driver/profile",
    element: <DriverProfilePage />,
  },
   {
        path: "/driver/orders/:orderId",
        element: <ViewOrderPage />,
    },

  {
    path: "/track/:orderId",
    element: <TrackOrderPage />,
  },
  {
    path: "/analytics",
    element: <AnalyticsPage />,
  },
  {
    path: "/profile",
    element: <MyProfilePage />,
  },
  

  // Ovde ćeš kasnije dodavati i druge rute
  // {
  //   path: "/dashboard",
  //   element: <DashboardPage />,
  // },
]);
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 
      CartProvider mora da obmota RouterProvider kako bi sve stranice
      unutar rutera imale pristup kontekstu korpe.
    */}
    <CartProvider>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" /> {/* Toaster može biti unutar ili van, ali ovako je čistije */}
    </CartProvider>
  </React.StrictMode>
);