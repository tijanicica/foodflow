// src/components/SupportAdminNavbar.jsx

import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";

const adminNavLinks = [
  { href: "/support/analytics", label: "Analytics" },
  { href: "/support/agent-performance", label: "Agent Performance" },
  { href: "/support/agent-management", label: "Agent Management" },
];

const NavItem = ({ href, label }) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <NavLink
      to={href}
      className={`px-2 py-1 transition-colors duration-200 text-lg ${
        isActive
          ? "text-brand-primary font-semibold border-b-2 border-brand-accent"
          : "text-brand-primary/70 hover:text-brand-primary"
      }`}
    >
      {label}
    </NavLink>
  );
};

export const SupportAdminNavbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Account"); // Inicijalno stanje

  // EFEKAT ZA UČITAVANJE IMENA KORISNIKA IZ TOKENA (PREUZETO IZ Navbar.jsx)
  useEffect(() => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        const decodedToken = jwtDecode(token);
        // Proveravamo polja 'name' ili 'fullName' iz tokena
        setUserName(decodedToken.name || decodedToken.fullName || "Account");
      }
    } catch (error) {
      console.error("Invalid token:", error);
      setUserName("Account");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm border-b">
      <Link
        to="/support/agent-management"
        className="text-3xl font-bold text-brand-primary italic"
      >
        foodFlow
      </Link>

      <div className="flex items-center gap-4">
        {/* Glavni navigacioni linkovi za admina */}
        <nav className="hidden md:flex items-center gap-6">
          {adminNavLinks.map((link) => (
            <NavItem key={link.href} {...link} />
          ))}
        </nav>

        {/* Separator i novi Dropdown Meni */}
        <div className="hidden md:block h-6 w-px bg-gray-200"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="rounded-full flex items-center gap-2 px-3 h-10"
            >
              <UserIcon className="h-5 w-5 text-brand-primary/70" />
              <span className="font-semibold text-brand-primary">
                {userName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mt-2">
            {/* VAŽNA PROMENA: link vodi ka /support/profile */}
            <DropdownMenuItem onClick={() => navigate("/support/profile")}>
              <UserIcon className="mr-2 h-4 w-4" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
