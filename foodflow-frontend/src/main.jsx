// Datoteka: src/main.jsx

window.global = window;
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet/dist/leaflet.css';

// Uvezite sve Vaše komponente i stranice
import { AppLayout } from './components/AppLayout'; // <-- NOVI IMPORT
import { MiniCart } from './components/MiniCart';   // <-- NOVI IMPORT
import { DriverLayout } from './layouts/DriverLayout.jsx';
import { ManagerLayout } from './layouts/ManagerLayout.jsx';
import { CustomerLayout } from './layouts/CustomerLayout.jsx'; 

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
import { PickedUpOrderPage } from './pages/PickedUpOrderPage';
import { MyProfilePage } from './pages/MyProfilePage';
import { ManagerDashboard } from './pages/ManagerDashboard.jsx';
import { ManagerProfilePage } from './pages/ManagerProfilePage.jsx';
import { ManagerMenuPage } from './pages/ManagerMenuPage.jsx';
import { ManagerEditMenuPage } from './pages/ManagerEditMenuPage.jsx';
import { AboutUsPage } from './pages/AboutUsPage.jsx';
import { FaqPage } from './pages/FaqPage.jsx';
import { ContactPage } from './pages/ContactPage.jsx';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage.jsx';
import { TermsOfServicePage } from './pages/TermsOfServicePage.jsx';
import { ManagerOrdersPage } from './pages/ManagerOrdersPage.jsx';
import { ManagerDeliveriesPage } from './pages/ManagerDeliveriesPage.jsx';
import { ManagerTrackOrderPage } from './pages/ManagerTrackOrderPage.jsx';
import { AdminManagerManagementPage } from './pages/AdminManagerManagementPage.jsx';

import { NotificationProvider } from './context/NotificationContext';


// Ovde ćeš kasnije dodavati i druge stranice (npr. DashboardPage)

// Kreiraj ruter i definiši putanje (rute)
const router = createBrowserRouter([
   {
    element: <CustomerLayout />,
    children: [
      {
        element: <AppLayout />,
        children: [
          // 2. PUTANJE SU SADA RELATIVNE U ODNOSU NA RODITELJSKI '/'
          { path: "home", element: <HomePage /> }, // Nema više kose crte
          { path: "restaurant/:restaurantId", element: <MenuPage /> },
          { path: "checkout", element: <CheckoutPage /> },
          { path: "orders", element: <MyOrdersPage /> },
          { path: "order/:orderId", element: <OrderDetailPage /> },
          { path: "track/:orderId", element: <TrackOrderPage /> },
          { path: "analytics", element: <AnalyticsPage /> },
          { path: "profile", element: <MyProfilePage /> },
          { path: "about", element: <AboutUsPage /> },
          { path: "faq", element: <FaqPage /> },
          { path: "contact", element: <ContactPage /> },
          { path: "privacy-policy", element: <PrivacyPolicyPage /> },
          { path: "terms-of-service", element: <TermsOfServicePage /> },
        ]
      }
    ]
},
 {
    // Definišemo DriverLayout kao "ram"
    element: <DriverLayout />, 
    
    // Sve stranice koje treba da budu unutar tog rama idu ovde, kao 'children'
    children: [ 
      { path: "/driver", element: <DriverDashboard /> },
      { path: "/driver/profile", element: <DriverProfilePage /> }, // <-- PREMEŠTENO UNUTRA
      { path: "/driver/orders/:orderId", element: <ViewOrderPage /> }, // <-- PREMEŠTENO UNUTRA
      { path: "/delivery/:orderId",  element: <PickedUpOrderPage /> }, // <-- PREMEŠTENO UNUTRA
    ]
  },

  // Manager
  {
    element: <ManagerLayout />,
    children: [
      { path: "/manager/dashboard", element: <ManagerDashboard /> },
      { path: "/manager/profile", element: <ManagerProfilePage /> },
      { path: "/manager/menu", element: <ManagerMenuPage /> },
      { path: "/manager/menu/:menuVersionId", element: <ManagerEditMenuPage /> },
      { path: "/manager/orders", element: <ManagerOrdersPage /> },
      { path: "/manager/deliveries", element: <ManagerDeliveriesPage /> },
      { path: "/manager/deliveries/track/:orderId", element: <ManagerTrackOrderPage /> },
    ]
  },
   
   // All
  { path: "/", element: <LoginPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

]);

ReactDOM.createRoot(document.getElementById('root')).render(
   <React.StrictMode> 
      <Toaster position="bottom-right" />

      {/* OVDE JE KLJUČNA PROMENA */}
      <NotificationProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </NotificationProvider>
      
   </React.StrictMode>
);