// Datoteka: src/main.jsx

window.global = window;
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// CSS Imports
import "./index.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet/dist/leaflet.css";

// Context Providers
import { CartProvider } from "./context/CartContext";
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { AppLayout } from './components/AppLayout';
import { DriverLayout } from './layouts/DriverLayout.jsx';
import { ManagerLayout } from './layouts/ManagerLayout.jsx';
import { CustomerLayout } from './layouts/CustomerLayout.jsx';

// Components
import { MiniCart } from './components/MiniCart';

// Pages
import { AboutUsPage } from "./pages/AboutUsPage.jsx";
import { AdminDriverPerformancePage } from './pages/AdminDriverPerformancePage.jsx';
import { AdminLiveTrackingPage } from './pages/AdminLiveTrackingPage.jsx';
import { AdminManagerManagementPage } from "./pages/AdminManagerManagementPage.jsx";
import { AnalyticsPage } from "./pages/AnalyticsPage.jsx";
import { CheckoutPage } from "./pages/CheckoutPage.jsx";
import { ContactPage } from "./pages/ContactPage.jsx";
import { DriverDashboard } from "./pages/DriverDashboard.jsx";
import { DriverProfilePage } from "./pages/DriverProfilePage.jsx";
import { FaqPage } from "./pages/FaqPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { ManagerDashboard } from "./pages/ManagerDashboard.jsx";
import { ManagerDeliveriesPage } from "./pages/ManagerDeliveriesPage.jsx";
import { ManagerEditMenuPage } from "./pages/ManagerEditMenuPage.jsx";
import { ManagerLiveTrackingPage } from './pages/ManagerLiveTrackingPage';
import { ManagerMenuPage } from "./pages/ManagerMenuPage.jsx";
import { ManagerOrdersPage } from "./pages/ManagerOrdersPage.jsx";
import { ManagerProfilePage } from "./pages/ManagerProfilePage.jsx";
import { ManagerTrackOrderPage } from "./pages/ManagerTrackOrderPage.jsx";
import { MenuPage } from "./pages/MenuPage.jsx";
import { MyOrdersPage } from "./pages/MyOrdersPage.jsx";
import { MyProfilePage } from "./pages/MyProfilePage";
import { OperatorManagementPage } from "./pages/OperatorManagementPage.jsx";
import { OrderDetailPage } from "./pages/OrderDetailPage.jsx";
import { PickedUpOrderPage } from "./pages/PickedUpOrderPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { SupportAdminProfilePage } from "./pages/SupportAdminProfilePage.jsx";
import { AgentPerformancePage } from "./pages/AgentPerformancePage.jsx";
import { DriverLayout } from './layouts/DriverLayout.jsx';
import { ManagerLayout } from './layouts/ManagerLayout.jsx';
import { CustomerLayout } from './layouts/CustomerLayout.jsx'; 
import { AdminDriverPerformancePage } from './pages/AdminDriverPerformancePage.jsx';
import { AdminLiveTrackingPage } from './pages/AdminLiveTrackingPage.jsx';
import { ManagerLiveTrackingPage } from './pages/ManagerLiveTrackingPage';
import { NotificationProvider } from './context/NotificationContext';
import { TermsOfServicePage } from "./pages/TermsOfServicePage.jsx";
import { TrackOrderPage } from "./pages/TrackOrderPage.jsx";
import { ViewOrderPage } from "./pages/ViewOrderPage";


// Kreiraj ruter i definiši putanje (rute)
const router = createBrowserRouter([
  // Rute za kupce (Customer) unutar CustomerLayout-a i AppLayout-a
  {

    // Glavni layout koji obmotava sve stranice koje treba da imaju MiniCart
    element: <AppLayout />,

    //Customer
    children: [
      { path: "/home", element: <HomePage /> },
      { path: "/restaurant/:restaurantId", element: <MenuPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/orders", element: <MyOrdersPage /> },
      { path: "/order/:orderId", element: <OrderDetailPage /> },
      { path: "/track/:orderId", element: <TrackOrderPage /> },
      { path: "/analytics", element: <AnalyticsPage /> },
      { path: "/profile", element: <MyProfilePage /> },
      { path: "/about", element: <AboutUsPage /> },
      { path: "/faq", element: <FaqPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
      { path: "/terms-of-service", element: <TermsOfServicePage /> },
    ],
  },
  // Driver
  { path: "/driver", element: <DriverDashboard /> },
  { path: "/driver/profile", element: <DriverProfilePage /> },
  { path: "/driver/orders/:orderId", element: <ViewOrderPage /> },
  { path: "/delivery/:orderId", element: <PickedUpOrderPage /> },

  // Manager
  { path: "/manager/dashboard", element: <ManagerDashboard /> },
  { path: "/manager/profile", element: <ManagerProfilePage /> },
  { path: "/manager/menu", element: <ManagerMenuPage /> },
  { path: "/manager/menu/:menuVersionId", element: <ManagerEditMenuPage /> },
  { path: "/manager/orders", element: <ManagerOrdersPage /> },
  { path: "/manager/deliveries", element: <ManagerDeliveriesPage /> },
  {
    path: "/manager/deliveries/track/:orderId",
    element: <ManagerTrackOrderPage />,
  },
  { path: "/admin/managers", element: <AdminManagerManagementPage /> },

  // Support Admin
  { path: "/support/agent-management", element: <OperatorManagementPage /> },
  { path: "/support/profile", element: <SupportAdminProfilePage /> },
  { path: "/support/agent-performance", element: <AgentPerformancePage /> },

  // All
   {
    element: <CustomerLayout />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/home", element: <HomePage /> },
          { path: "/restaurant/:restaurantId", element: <MenuPage /> },
          { path: "/checkout", element: <CheckoutPage /> },
          { path: "/orders", element: <MyOrdersPage /> },
          { path: "/order/:orderId", element: <OrderDetailPage /> },
          { path: "/track/:orderId", element: <TrackOrderPage /> },
          { path: "/analytics", element: <AnalyticsPage /> },
          { path: "/profile", element: <MyProfilePage /> },
          { path: "/about", element: <AboutUsPage /> },
          { path: "/faq", element: <FaqPage /> },
          { path: "/contact", element: <ContactPage /> },
          { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
          { path: "/terms-of-service", element: <TermsOfServicePage /> },
        ]
      }
    ]
  },
  // Rute za vozače (Driver) unutar DriverLayout-a
  {
    element: <DriverLayout />,
    children: [
      { path: "/driver", element: <DriverDashboard /> },
      { path: "/driver/profile", element: <DriverProfilePage /> },
      { path: "/driver/orders/:orderId", element: <ViewOrderPage /> },
      { path: "/delivery/:orderId", element: <PickedUpOrderPage /> },
    ]
  },
  // Rute za menadžere (Manager) unutar ManagerLayout-a
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
      { path: "/manager/live-tracking", element: <ManagerLiveTrackingPage /> },
    ]
  },
  // Rute za administratora (Admin)
  { path: "/admin/dashboard", element: <AdminManagerManagementPage /> },
  { path: "/admin/managers", element: <AdminManagerManagementPage /> },
  { path: "/admin/driver-performance", element: <AdminDriverPerformancePage /> },
  { path: "/admin/live-tracking", element: <AdminLiveTrackingPage /> },

  // Rute za podršku (Support Admin)
  { path: "/support/agent-management", element: <OperatorManagementPage /> },
  { path: "/support/profile", element: <SupportAdminProfilePage /> },

  // Rute koje nemaju poseban layout (Login, Register)
  { path: "/", element: <LoginPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Context Provideri obmotavaju celu aplikaciju */}
    <NotificationProvider>
      <CartProvider>
        {/* RouterProvider pruža definisane rute aplikaciji */}
        <RouterProvider router={router} />
        {/* Toaster za prikaz notifikacija, sada samo jedan */}
        <Toaster position="bottom-right" />
      </CartProvider>
    </NotificationProvider>
  </React.StrictMode>
);