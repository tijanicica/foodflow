import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from '@/services/api';
import { Link, useNavigate } from 'react-router-dom';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import Select from 'react-select';
import countryList from 'country-list';
import { geocodeAddress } from '@/services/geocoding';
import toast from 'react-hot-toast';

export function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: {
            nickname: '',
            country: '',
            city: '',
            street: '',
            streetNumber: '',
            postalCode: '',
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
    // --- JEDNOSTAVNIJI handleChange ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // --- POSEBAN HANDLER ZA ADRESU ---
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [name]: value }
        }));
    };

    const handlePhoneChange = (value) => {
        setFormData(prev => ({ ...prev, phone: value || '' }));
    };

    const countryOptions = useMemo(() => countryList.getData().map(c => ({
        value: c.label, // Koristimo ime države kao vrednost
        label: c.name
    })), []);

    const handleCountryChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, country: selectedOption.label }
        }));
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Očisti prethodne poruke o grešci/uspehu
    setError('');
    setSuccess('');

    // 2. Frontend validacija
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.phone) {
        setError("Phone number is required.");
        return;
    }
    if (!formData.address.country) {
        setError("Country is required.");
        return;
    }
    // (Možete dodati još validacija ovde)

    // 3. Postavi stanje da je slanje u toku (za disable dugmeta)
    setIsSubmitting(true);

    try {
        // 4. Geokodiranje adrese
        // Ako ovo ne uspe, baca grešku i odmah se skače u 'catch' blok
        console.log("Geocoding address:", formData.address); // Za debagovanje
        const coordinates = await geocodeAddress(formData.address);

        // 5. Kreiranje finalnog objekta za slanje na server
        const dataToSend = {
            ...formData,
            address: {
                ...formData.address,
                ...coordinates // Dodajemo latitude i longitude
            }
        };
        
        // 6. Slanje podataka na server
        await registerUser(dataToSend);
        
        // 7. Prikaz poruke o uspehu i preusmeravanje
        setSuccess('Registration successful! Redirecting to login...');
        toast.success('Registration successful!'); // Dupla notifikacija, ali OK
        
        setTimeout(() => {
            navigate('/login');
        }, 2000);

    } catch (err) {
        // 8. Rukovanje greškama
        // Uhvatiće grešku iz geocodeAddress() ili iz registerUser()
        const errorMessage = err.response?.data?.message // Greška sa servera (npr. email in use)
                             || err.message              // Greška iz geokodera (npr. Address not found)
                             || 'An unexpected error occurred.'; // Generička greška
        
        setError(errorMessage); // Prikazuje grešku ispod forme
        
    } finally {
        // 9. Uvek se izvršava na kraju, bilo uspešno ili ne
        setIsSubmitting(false); // Ponovo omogući dugme
    }
};

    return (
        <main className="w-full min-h-screen flex items-center justify-center bg-brand-background-light p-6">
            <div className="w-full max-w-lg">
                {/* ... (Logo ostaje isti) ... */}
                <div className="bg-white p-8 rounded-xl shadow-md ...">
                    <form onSubmit={handleSubmit} className="grid gap-6">
                        <h2 className="text-3xl font-bold text-brand-primary">Create an account</h2>
                        
                        {/* KORISTIMO 'name' ATRIBUT UMESTO 'id' */}
                        <InputWithLabel name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} />
                        <InputWithLabel name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} />
                        <InputWithLabel name="email" label="Email" type="email" value={formData.email} onChange={handleChange} />
                        <div className="grid gap-2">
                            <Label>Phone Number</Label>
                            <PhoneInput value={formData.phone} onChange={handlePhoneChange} className="custom-phone-input" required />
                        </div>
                        <InputWithLabel name="password" label="Password" type="password" value={formData.password} onChange={handleChange} />
                        <InputWithLabel name="confirmPassword" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange} />
                        <hr />
                        <h3 className="text-xl font-bold text-brand-primary">Your Address</h3>
                        
                        {/* POLJA ZA ADRESU SADA KORISTE 'handleAddressChange' */}
                        <InputWithLabel name="nickname" label="Address Nickname" value={formData.address.nickname} onChange={handleAddressChange} />
                        <div className="grid gap-2">
                            <Label>Country</Label>
                            <Select options={countryOptions} onChange={handleCountryChange} required />
                        </div>
                        <InputWithLabel name="city" label="City" value={formData.address.city} onChange={handleAddressChange} />
                        <InputWithLabel name="street" label="Street" value={formData.address.street} onChange={handleAddressChange} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputWithLabel name="streetNumber" label="Street Number" value={formData.address.streetNumber} onChange={handleAddressChange} />
                            <InputWithLabel name="postalCode" label="Postal Code" value={formData.address.postalCode} onChange={handleAddressChange} />
                        </div>
                        
                        <Button type="submit" disabled={isSubmitting} className="...">
                            {isSubmitting ? 'Registering...' : 'Register'}
                        </Button>
                        {/* ... (Link ka login) ... */}
                    </form>
                </div>
            </div>
        </main>
    );
}

// Mala izmena u InputWithLabel da koristi 'name'
const InputWithLabel = ({ name, label, ...props }) => (
    <div className="grid gap-2">
        <Label htmlFor={name}>{label}</Label>
        <Input id={name} name={name} required {...props} />
    </div>
);