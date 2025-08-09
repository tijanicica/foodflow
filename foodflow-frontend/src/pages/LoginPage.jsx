// src/pages/LoginPage.jsx
import { useState } from 'react'; // Uvezi useState
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from '@/services/api'; // Uvezi našu novu funkciju
import { Link, useNavigate } from 'react-router-dom';

export function LoginPage() {
  // Stanje za čuvanje emaila i lozinke
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Stanje za čuvanje poruke o grešci
  const navigate = useNavigate();

  // Funkcija koja se poziva na submit forme
  const handleSubmit = async (event) => {
    event.preventDefault(); // Sprečava refresh stranice
    setError(''); // Resetuj grešku pre novog pokušaja

    try {
      const data = await loginUser(email, password);
      console.log('Login successful!', data);

      // KLJUČNA PROMENA: Preusmeri korisnika na Home stranicu
      // Tvoja Home stranica za ulogovanog korisnika je verovatno na putanji "/home"
      // Prilagodi putanju ako je drugačija
      navigate('/home'); 

    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please check your credentials.');
    }
  };


  return (
    <main className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-12 bg-brand-background-light">
        <form onSubmit={handleSubmit} className="mx-auto grid w-full max-w-sm gap-8"> {/* Dodaj form i onSubmit */}
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
                  value={email} // Poveži sa stanjem
                  onChange={(e) => setEmail(e.target.value)} // Ažuriraj stanje
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
                  value={password} // Poveži sa stanjem
                  onChange={(e) => setPassword(e.target.value)} // Ažuriraj stanje
                />
              </div>
              {/* Prikaz poruke o grešci */}
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
              to="/register" // <-- Koristi 'to' umesto 'href'
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