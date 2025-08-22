// src/components/OperatorNavbar.jsx

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

const operatorNavLinks = [
  { href: "/operator/dashboard", label: "Dashboard" },
  { href: "/operator/analytics", label: "Analytics" },
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

export const OperatorNavbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Account");

  useEffect(() => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        const decodedToken = jwtDecode(token);
        setUserName(decodedToken.name || decodedToken.fullName || "Account");
      }
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm border-b">
      <div className="flex items-center gap-3">
        <Link
          to="/operator/dashboard"
          className="text-3xl font-bold text-brand-primary italic"
        >
          foodFlow
        </Link>
        <span className="bg-brand-background text-brand-primary font-semibold text-xs px-2.5 py-1 rounded-full">
          SUPPORT-OPERATOR
        </span>
      </div>
      <div className="flex items-center gap-4">
        <nav className="hidden md:flex items-center gap-6">
          {operatorNavLinks.map((link) => (
            <NavItem key={link.href} {...link} />
          ))}
        </nav>
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
            <DropdownMenuItem onClick={() => navigate("/operator/profile")}>
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
