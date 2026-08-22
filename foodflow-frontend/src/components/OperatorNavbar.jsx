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
import { LogOut, User as UserIcon, Menu, X } from "lucide-react"; // <-- NOVI IMPORTI
import { motion, AnimatePresence } from "framer-motion"; // <-- NOVI IMPORT

const operatorNavLinks = [
  { href: "/operator/dashboard", label: "Dashboard" },
  { href: "/operator/analytics", label: "Analytics" },
];

const NavItem = ({ href, label, onClick }) => {
  // <-- Dodat onClick prop
  const location = useLocation();
  const isActive = location.pathname === href;
  return (
    <NavLink
      to={href}
      onClick={onClick}
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
  const [isMenuOpen, setIsMenuOpen] = useState(false); // <-- NOVI STATE

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
    setIsMenuOpen(false);
  };

  const navigateTo = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm border-b">
        {/* Logo i Tag */}
        <div className="flex items-center gap-3">
          <Link
            to="/operator/dashboard"
            className="text-3xl font-bold text-brand-primary italic"
          >
            foodFlow
          </Link>
          <span className="bg-brand-background text-brand-primary font-semibold text-xs px-2.5 py-1 rounded-full hidden sm:block">
            OPERATOR
          </span>
        </div>

        {/* Desktop Meni */}
        <div className="hidden lg:flex items-center gap-4">
          <nav className="flex items-center gap-6">
            {operatorNavLinks.map((link) => (
              <NavItem key={link.href} {...link} />
            ))}
          </nav>
          <div className="h-6 w-px bg-gray-200"></div>
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
              <DropdownMenuItem onClick={() => navigateTo("/operator/profile")}>
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

        {/* Hamburger Ikonica */}
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Mobilni Meni (Side Panel) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 right-0 h-full bg-white w-4/5 max-w-sm p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-2xl font-bold text-brand-primary italic">
                  Menu
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex flex-col gap-2 text-lg">
                {operatorNavLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => navigateTo(link.href)}
                    className="text-left p-3 rounded-md hover:bg-gray-100"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="w-full h-px bg-gray-200 my-4"></div>
                <button
                  onClick={() => navigateTo("/operator/profile")}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 font-medium"
                >
                  <UserIcon size={20} />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 rounded-md text-red-600 hover:bg-red-50 font-semibold"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
