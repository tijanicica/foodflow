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
import { LogOut, User as UserIcon, Menu, X } from "lucide-react"; // <-- NOVI IMPORTI: Menu, X
import { motion, AnimatePresence } from "framer-motion"; // <-- NOVI IMPORT

const adminNavLinks = [
  { href: "/support/analytics", label: "Analytics" },
  { href: "/support/agent-performance", label: "Agent Performance" },
  { href: "/support/agent-management", label: "Agent Management" },
];

// NavItem komponenta ostaje ista
const NavItem = ({ href, label, onClick }) => {
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

export const SupportAdminNavbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Account");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // <-- NOVI STATE za mobilni meni

  useEffect(() => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        const decodedToken = jwtDecode(token);
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
    setIsMenuOpen(false); // Zatvori meni nakon logout-a
  };

  const navigateTo = (path) => {
    navigate(path);
    setIsMenuOpen(false); // Zatvori meni nakon navigacije
  };

  return (
    <>
      <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm border-b">
        {/* Logo i Tag */}
        <div className="flex items-center gap-3">
          <Link
            to="/support/agent-management"
            className="text-3xl font-bold text-brand-primary italic"
          >
            foodFlow
          </Link>
          <span className="bg-brand-background text-brand-primary font-semibold text-xs px-2.5 py-1 rounded-full hidden sm:block">
            SUPPORT ADMIN
          </span>
        </div>

        {/* Desktop Meni */}
        <div className="hidden lg:flex items-center gap-4">
          <nav className="flex items-center gap-6">
            {adminNavLinks.map((link) => (
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
              <DropdownMenuItem onClick={() => navigateTo("/support/profile")}>
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

        {/* Hamburger Ikonica za mobilne uređaje */}
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

      {/* ===== Mobilni Meni (Side Panel) ===== */}
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
                {/* Linkovi iz navigacije */}
                {adminNavLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => navigateTo(link.href)}
                    className="text-left p-3 rounded-md hover:bg-gray-100"
                  >
                    {link.label}
                  </button>
                ))}

                {/* Separator */}
                <div className="w-full h-px bg-gray-200 my-4"></div>

                {/* Linkovi za nalog */}
                <button
                  onClick={() => navigateTo("/support/profile")}
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
