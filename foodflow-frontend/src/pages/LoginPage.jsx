// src/pages/LoginPage.jsx

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from '@/services/api';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // <-- 1. Uvezite jwt-decode

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      // Vaš API poziv za prijavu
      const response = await loginUser(email, password); // Pretpostavka: response = { token: '...' }
      const { token } = response;

      // 2. Sačuvajte token u Local Storage. Ovo je ključno!
      localStorage.setItem('jwtToken', token);

      // 3. Dekodirajte token i izvucite ulogu
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role; // Čita 'role' polje koje je backend postavio

      // 4. Preusmjerite korisnika na osnovu njegove uloge
      switch (userRole) {
        case 'ROLE_DRIVER':
          navigate('/driver'); // Vozač ide na /driver
          break;
        case 'ROLE_CUSTOMER':
          navigate('/home'); // Kupac ide na /home
          break;
        case 'ROLE_OPERATOR':
          navigate('/operator/dashboard'); // Primjer rute za operatora
          break;
         // ===== ISPRAVKA JE OVDE =====
        case 'ROLE_MANAGER':
          navigate('/manager/dashboard'); // Bilo je '/manager/overview'
          break;
        // ============================
        case 'ROLE_ADMINISTRATOR':
          navigate('/admin/panel'); // Primjer rute za administratora
          break;
        case 'ROLE_SUPPORT_ADMINISTRATOR':
          navigate('/support/tickets'); // Primjer rute za podršku
          break;
        default:
          // Ako uloga nije prepoznata, vrati ga na login ili prikaži grešku
          console.warn(`Unknown role: ${userRole}`);
          navigate('/login');
          break;
      }

    } catch (err) {
      console.error('Login failed:', err);
      // Prikazivanje konkretnije greške ako je backend pošalje
      const errorMessage = err.response?.data || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    }
  };

  return (
    <main className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-12 bg-brand-background-light">
        <form onSubmit={handleSubmit} className="mx-auto grid w-full max-w-sm gap-8">
          <div className="absolute top-8 left-8">
            <h1 className="text-3xl font-bold text-brand-primary italic">
              foodFlow
            </h1>
            <p className="text-brand-primary/70 text-sm text-center">anywhere you are</p>
          </div>
          <div className="grid gap-6 text-left">
            <div className="grid gap-2"></div>
            <div className="grid gap-8">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-brand-primary/90">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="bg-transparent border-0 border-b-2 border-brand-accent rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-brand-primary/90">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  className="bg-transparent border-0 border-b-2 border-brand-accent rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full h-12 text-lg rounded-xl bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90"
              >
                Login
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="hidden lg:flex relative items-end justify-center p-10">
        <img
          src="/foodflowlogin.png"
          alt="A delicious display of food"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 bg-brand-background-light/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md">
          <p className="text-sm text-brand-primary">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold underline underline-offset-4 text-brand-primary"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}