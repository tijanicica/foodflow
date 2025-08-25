// src/components/DynamicNavbar.jsx

import React from "react";
import { jwtDecode } from "jwt-decode";

// Uvozimo sve tri moguće navigacione trake
import { Navbar } from "./Navbar"; // Standardna za kupce i neregistrovane
import { OperatorNavbar } from "./OperatorNavbar";
import { SupportAdminNavbar } from "./SupportAdminNavbar";

export const DynamicNavbar = () => {
  // Pomoćna funkcija za čitanje uloge iz tokena
  const getRoleFromToken = () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        // Ako nema tokena, korisnik nije ulogovan
        return null;
      }
      const decodedToken = jwtDecode(token);
      // Vraćamo ulogu iz "payload"-a tokena.
      // Vaš JwtService.java upisuje ulogu pod ključem "role".
      return decodedToken.role;
    } catch (error) {
      // Ako je token neispravan ili istekao
      console.error("Could not decode token:", error);
      return null;
    }
  };

  const userRole = getRoleFromToken();

  // Na osnovu uloge, renderujemo odgovarajuću komponentu
  switch (userRole) {
    case "ROLE_OPERATOR":
      return <OperatorNavbar />;
    case "ROLE_SUPPORT_ADMINISTRATOR":
      return <SupportAdminNavbar />;

    // Svi ostali (uključujući ROLE_CUSTOMER i one koji nisu ulogovani)
    // će videti standardnu navigaciju.
    case "ROLE_CUSTOMER":
    default:
      return <Navbar />;
  }
};
