import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom"; // Uvezi ruter
import './index.css';

// Uvezi sve tvoje stranice
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { MenuPage } from './pages/MenuPage.jsx';
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
  // Ovde ćeš kasnije dodavati i druge rute
  // {
  //   path: "/dashboard",
  //   element: <DashboardPage />,
  // },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} /> {/* Umesto <App />, koristi RouterProvider */}
  </React.StrictMode>,
);