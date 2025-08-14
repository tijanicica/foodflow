import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import toast from 'react-hot-toast';

export const Footer = () => {
  // Pomoćna funkcija za mock linkove
  const handleMockLinkClick = (e) => {
    e.preventDefault(); // Sprečava da se stranica osveži
    toast.info("This page is under construction!");
  };

  return (
    <footer className="bg-[#4A4A4A] text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo i opis */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/home" className="inline-block mb-4">
              <span className="text-3xl font-bold italic text-[#D4A056]">foodFlow</span>
            </Link>
            <p className="text-slate-300 pr-8">
              The easiest way to get your favorite food delivered right to your door. Discover local restaurants and enjoy a world of flavors.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" onClick={handleMockLinkClick} className="hover:text-[#D4A056] transition-colors">About Us</a></li>
              <li><a href="#" onClick={handleMockLinkClick} className="hover:text-[#D4A056] transition-colors">FAQ</a></li>
              <li><a href="#" onClick={handleMockLinkClick} className="hover:text-[#D4A056] transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-lg mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" aria-label="Facebook" className="text-slate-300 hover:text-[#D4A056] transition-colors"><Facebook size={24} /></a>
              <a href="#" aria-label="Twitter" className="text-slate-300 hover:text-[#D4A056] transition-colors"><Twitter size={24} /></a>
              <a href="#" aria-label="Instagram" className="text-slate-300 hover:text-[#D4A056] transition-colors"><Instagram size={24} /></a>
            </div>
          </div>
        </div>

        {/* Donja linija */}
        <div className="mt-12 pt-8 border-t border-slate-700 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} FoodFlow. All Rights Reserved.</p>
          <p className="mt-1">
            <a href="#" onClick={handleMockLinkClick} className="hover:text-white">Privacy Policy</a> &middot; <a href="#" onClick={handleMockLinkClick} className="hover:text-white">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
};