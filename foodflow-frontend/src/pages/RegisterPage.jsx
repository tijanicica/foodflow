// src/pages/RegisterPage.jsx
import { useState, useMemo } from 'react'; // <-- ISPRAVLJENO!
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from '@/services/api';
import { Link } from 'react-router-dom';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import Select from 'react-select';
import countryList from 'country-list';

export function RegisterPage() {
  const [phone, setPhone] = useState();
  const [country, setCountry] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '', // Ovo polje će se popunjavati iz PhoneInput-a
    password: '',
    confirmPassword: '',
    address: {
      nickname: '',
      country: '', // Ovo polje će se popunjavati iz Select-a
      city: '',
      street: '',
      streetNumber: '',
      postalCode: '',
    },
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id.startsWith('address.')) {
      const addressField = id.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };
  
  // Ažurirana funkcija za promenu telefona
  const handlePhoneChange = (value) => {
    setPhone(value);
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const countryOptions = useMemo(() => countryList.getData().map(c => ({
    value: c.code,
    label: c.name
  })), []);

  const handleCountryChange = (selectedOption) => {
    setCountry(selectedOption);
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, country: selectedOption.label }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    // Proveravamo da li su telefon i država uneti
    if (!formData.phone) {
        setError("Phone number is required.");
        return;
    }
    if (!formData.address.country) {
        setError("Country is required.");
        return;
    }

    try {
      const response = await registerUser(formData);
      setSuccess('Registration successful! You can now log in.');
      console.log('Registration response:', response);
    } catch (err) {
      setError(err.response?.data || 'An unexpected error occurred.');
      console.error('Registration failed:', err);
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-brand-background-light p-6">
      <div className="w-full max-w-lg">
        <div className="absolute top-8 left-8">
            <h1 className="text-3xl font-bold text-brand-primary italic">
              foodFlow
            </h1>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-md border border-brand-accent/20">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <h2 className="text-3xl font-bold text-brand-primary">Create an account</h2>
            
            <InputWithLabel id="firstName" label="First Name" value={formData.firstName} onChange={handleChange} />
            <InputWithLabel id="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} />
            <InputWithLabel id="email" label="Email" type="email" value={formData.email} onChange={handleChange} />
             <div className="grid gap-2">
                <Label htmlFor="phone" className="text-brand-primary/90">Phone Number</Label>
                <PhoneInput
                  id="phone"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={handlePhoneChange} // Koristi novu funkciju
                  className="custom-phone-input"
                  required
                />
            </div>
            <InputWithLabel id="password" label="Password" type="password" value={formData.password} onChange={handleChange} />
            <InputWithLabel id="confirmPassword" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange} />

            <hr className="border-brand-accent/30 my-2" />

            <h3 className="text-xl font-bold text-brand-primary">Your Address</h3>
            <InputWithLabel id="address.nickname" label="Address Nickname (e.g. Home, Work)" value={formData.address.nickname} onChange={handleChange} />
             <div className="grid gap-2">
                <Label htmlFor="address.country" className="text-brand-primary/90">Country</Label>
                <Select
                  options={countryOptions}
                  value={country}
                  onChange={handleCountryChange}
                  placeholder="Select a country..."
                  required
                  styles={customSelectStyles}
                />
            </div>
            <InputWithLabel id="address.city" label="City" value={formData.address.city} onChange={handleChange} />
            <InputWithLabel id="address.street" label="Street" value={formData.address.street} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
              <InputWithLabel id="address.streetNumber" label="Street Number" value={formData.address.streetNumber} onChange={handleChange} />
              <InputWithLabel id="address.postalCode" label="Postal Code" value={formData.address.postalCode} onChange={handleChange} />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <Button type="submit" className="w-full h-12 text-lg rounded-xl bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90 mt-4">
              Register
            </Button>
            <p className="text-center text-sm text-brand-primary/80 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold underline underline-offset-4 text-brand-primary">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

// Mala pomoćna komponenta da se ne ponavlja kod
const InputWithLabel = ({ id, label, type = 'text', value, onChange }) => (
  <div className="grid gap-2">
    <Label htmlFor={id} className="text-brand-primary/90">{label}</Label>
    <Input
      id={id}
      type={type}
      required
      className="bg-transparent border-0 border-b-2 border-brand-accent rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      value={value}
      onChange={onChange}
    />
  </div>
);
const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid hsl(var(--brand-accent))',
    borderRadius: 0,
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'hsl(var(--brand-accent))',
    },
  }),
  // Stilovi za input i selektovanu vrednost ostaju isti
  input: (provided) => ({ ...provided, color: 'hsl(var(--brand-primary))' }),
  singleValue: (provided) => ({ ...provided, color: 'hsl(var(--brand-primary))' }),
  placeholder: (provided) => ({ ...provided, color: 'hsl(var(--muted-foreground))' }),
  
  // Stilovi za ceo padajući meni
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#FFFEF5', // <-- KORISTI EKSPLICITNU BOJU POZADINE (npr. tvoja krem boja)
    border: '1px solid hsl(var(--brand-accent))', // Dodajemo i ivicu da izgleda lepše
    borderRadius: '8px', // Malo zaobljenja
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Dodajemo senku
    zIndex: 9999,
  }),

  // Stilovi za svaku pojedinačnu opciju u meniju
  option: (provided, state) => ({
    ...provided,
    // POZADINA JE UVEK NEPROVIDNA
    backgroundColor: state.isSelected 
      ? 'hsl(var(--brand-accent))' // Boja kada je selektovan
      : state.isFocused 
        ? '#F7F2E9' // Boja kada je hoverovan (malo tamnija krem)
        : '#FFFEF5', // Default pozadina za sve opcije
    
    // BOJA TEKSTA
    color: state.isSelected ? 'white' : 'hsl(var(--brand-primary))',

    // Uklanjamo defaultni hover efekat jer smo ga sami definisali
    '&:active': {
      backgroundColor: 'hsl(var(--brand-accent))',
    },
  }),
};