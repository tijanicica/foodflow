import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from '@/services/api';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await loginUser(email, password);
      const { token } = response;
      
      localStorage.setItem('jwtToken', token);
      const decodedToken = jwtDecode(token);

      // === KLJUČNA IZMENA: KREIRANJE STANDARDIZOVANOG USER OBJEKTA ===
      // Kreiramo novi objekat koji uvek ima ista imena polja,
      // bez obzira na to kako se zovu u sirovom tokenu.
      const userToStore = {
        id: decodedToken.id,
        // Koristi 'sub' ako postoji, inače koristi 'email'.
        sub: decodedToken.sub || decodedToken.email, 
        // Koristi 'role' ako postoji, inače koristi 'authority' ili 'roles'.
        role: decodedToken.role || decodedToken.authority || (Array.isArray(decodedToken.roles) ? decodedToken.roles[0] : null)
      };

      // Proveravamo da li smo uspeli da izvučemo ključne podatke
      if (!userToStore.role || !userToStore.sub) {
          throw new Error("User role or email could not be determined from the token.");
      }

      // Sada čuvamo naš novi, čisti objekat.
      localStorage.setItem('user', JSON.stringify(userToStore));
      // =================================================================

      const userRole = userToStore.role; // Koristimo rolu iz našeg novog objekta

      let destination = '/login';
      switch (userRole) {
        case 'ROLE_DRIVER': destination = '/driver'; break;
        case 'ROLE_CUSTOMER': destination = '/home'; break;
        case 'ROLE_OPERATOR': destination = '/operator/dashboard'; break;
        case 'ROLE_MANAGER': destination = '/manager/dashboard'; break;
        case 'ROLE_SUPPORT_ADMINISTRATOR': destination = '/support/tickets'; break;
        case 'ROLE_ADMINISTRATOR': destination = '/admin/managers'; break;
        default: console.warn(`Unknown role: ${userRole}`); break;
      }
      
      navigate(destination);
      
      // Sa malom pauzom šaljemo događaj da se layout-i koji su se upravo učitali
      // mogu povezati na WebSocket.
      setTimeout(() => {
        window.dispatchEvent(new Event("userLoggedIn"));
      }, 50);

    } catch (err) {
      // Poboljšano rukovanje greškama
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">
      
      {/* LEVA STRANA */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-[#F9F5EC]">
        <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold text-[#4A4A4A] italic">foodFlow</h1>
            <p className="text-[#4A4A4A]/70 text-sm -mt-1">anywhere you are</p>
        </div>

        <motion.div 
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#4A4A4A]">Welcome Back!</h2>
            <p className="text-gray-500 mt-1">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-semibold text-gray-700">Email Address</Label>
              <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="h-12 bg-gray-50 border-gray-300 focus:border-brand-primary focus:ring-brand-primary rounded-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password" className="font-semibold text-gray-700">Password</Label>
              <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="h-12 bg-gray-50 border-gray-300 focus:border-brand-primary focus:ring-brand-primary rounded-md"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
            </div>
            
            <div className="h-14">
              {error && (
                <motion.div 
                  className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md flex items-center gap-3 text-sm"
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                >
                  <AlertTriangle size={20} />
                  <span>{error}</span>
                </motion.div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors -mt-6"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </Button>
            
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold underline text-brand-primary hover:text-brand-primary/90">
                Register
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      {/* DESNA STRANA */}
      <div className="hidden lg:flex relative items-center justify-center bg-gray-900">
        <img
          src="foodflowlogin.png"
          alt="A delicious display of food"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative z-10 text-center text-white p-10">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.3, duration: 0.5 }}
           >
            <h2 className="text-5xl font-extrabold leading-tight tracking-tight">
              Your next meal <br/> is just a click away.
            </h2>
            <p className="mt-4 text-lg text-gray-200 max-w-md mx-auto">
              From local gems to popular chains, find all your favorite restaurants in one place.
            </p>
           </motion.div>
        </div>
      </div>
    </div>
  );
}