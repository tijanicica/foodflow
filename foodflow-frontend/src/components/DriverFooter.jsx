// FAJL: src/components/DriverFooter.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from 'lucide-react';

export const DriverFooter = () => {
  return (
    <footer className="bg-[#4A4A4A] text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo i opis za vozača */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/driver" className="inline-block mb-4">
              <span className="text-3xl font-bold italic text-[#D4A056]">foodFlow</span>
            </Link>
            <p className="text-slate-300 pr-8">
              Your partner in delivery. Manage your orders, track your earnings, and get support all in one place.
            </p>
          </div>

          {/* Linkovi za vozača */}
          <div>
            <h3 className="font-bold text-lg mb-4">Driver Menu</h3>
            <ul className="space-y-2 text-slate-300">
              {/* Ovi linkovi vode na stranice relevantne za vozača */}
              <li><Link to="/driver" className="hover:text-[#D4A056] transition-colors">Dashboard</Link></li>
              <li><Link to="/driver/earnings" className="hover:text-[#D4A056] transition-colors">My Earnings</Link></li>
              <li><Link to="/driver/support" className="hover:text-[#D4A056] transition-colors">Support Center</Link></li>
            </ul>
          </div>

          {/* Social Media (ovo može ostati isto radi brendinga) */}
          <div>
            <h3 className="font-bold text-lg mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" aria-label="Facebook" className="text-slate-300 hover:text-[#D4A056] transition-colors"><Facebook size={24} /></a>
              <a href="#" aria-label="Twitter" className="text-slate-300 hover:text-[#D4A056] transition-colors"><Twitter size={24} /></a>
              <a href="#" aria-label="Instagram" className="text-slate-300 hover:text-[#D4A056] transition-colors"><Instagram size={24} /></a>
            </div>
          </div>
        </div>

        {/* Donja linija (legalni linkovi su obično isti za sve) */}
        <div className="mt-12 pt-8 border-t border-slate-700 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} FoodFlow. All Rights Reserved for our Delivery Partners.</p>
          <p className="mt-1">
            <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link> &middot; <Link to="/terms-of-service" className="hover:text-white">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );


};