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
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle, ArrowLeft, User, Home as HomeIcon } from 'lucide-react';

//================================================================================
// POMOĆNE KOMPONENTE
//================================================================================

const ProgressBar = ({ currentStep }) => (
    <div className="w-full px-4 sm:px-8 mb-6">
        <div className="flex items-center">
            <div className="flex flex-col items-center text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${currentStep >= 1 ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-500'}`}><User size={20} /></div>
                <p className={`mt-2 text-xs font-semibold ${currentStep >= 1 ? 'text-brand-primary' : 'text-gray-500'}`}>Account</p>
            </div>
            <div className={`flex-grow h-1 mx-2 transition-colors duration-300 ${currentStep > 1 ? 'bg-brand-primary' : 'bg-gray-200'}`}></div>
            <div className="flex flex-col items-center text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${currentStep >= 2 ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-500'}`}><HomeIcon size={20} /></div>
                <p className={`mt-2 text-xs font-semibold ${currentStep >= 2 ? 'text-brand-primary' : 'text-gray-500'}`}>Address</p>
            </div>
        </div>
    </div>
);

const InputWithLabel = ({ name, label, ...props }) => (
    <div className="grid gap-2">
        <Label htmlFor={name} className="font-semibold text-gray-700">{label}</Label>
        <Input id={name} name={name} required {...props} className="h-11 bg-gray-50 border-gray-300 focus:border-brand-primary focus:ring-brand-primary rounded-lg"/>
    </div>
);

//================================================================================
// GLAVNA KOMPONENTA STRANICE
//================================================================================

export function RegisterPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
        address: { nickname: '', country: '', city: '', street: '', streetNumber: '', postalCode: '' },
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Sva logika ostaje ista i ispravna
    const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleAddressChange = (e) => setFormData(p => ({ ...p, address: { ...p.address, [e.target.name]: e.target.value } }));
    const handlePhoneChange = (value) => setFormData(p => ({ ...p, phone: value || '' }));
    const handleCountryChange = (option) => setFormData(p => ({ ...p, address: { ...p.address, country: option.value } }));

    const countryOptions = useMemo(() => countryList.getData().map(c => ({ value: c.code, label: c.name })), []);

    const handleNext = () => {
        setError('');
        if (step === 1) {
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) { return setError("Please fill in all account fields."); }
            if (formData.password.length < 6) { return setError("Password must be at least 6 characters long."); }
            if (formData.password !== formData.confirmPassword) { return setError("Passwords do not match."); }
        }
        setStep(prev => prev + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.phone || !formData.address.country || !formData.address.city || !formData.address.street) { return setError("Please fill in all address and contact fields."); }
        setIsSubmitting(true);
        try {
            const addressForGeocoding = { ...formData.address, country: countryList.getName(formData.address.country) || formData.address.country };
            const coordinates = await geocodeAddress(addressForGeocoding);
            const dataToSend = {
                firstName: formData.firstName, lastName: formData.lastName, email: formData.email, phone: formData.phone, password: formData.password, confirmPassword: formData.confirmPassword,
                address: { ...formData.address, latitude: coordinates.latitude, longitude: coordinates.longitude }
            };
            await registerUser(dataToSend);
            toast.success('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'An unexpected error occurred.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const customSelectStyles = {
        control: (provided) => ({ ...provided, minHeight: '44px', backgroundColor: '#F9FAFB', borderColor: '#D1D5DB' }),
        input: (provided) => ({ ...provided, height: '40px' }),
        option: (provided, state) => ({...provided, backgroundColor: state.isSelected ? '#4F4A40' : 'white', '&:hover': {backgroundColor: '#EAE3D3'}}),
    };
    const variants = {
        enter: { opacity: 0, x: 30 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 },
    };

    return (
        <main className="w-full min-h-screen relative flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 z-0">
                <img src="/images/hero-background.avif" alt="Food background" className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-black/40"></div>
            </div>
          <motion.div
                className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            >
                <div className="text-center mb-6">
                    <Link to="/login"><h1 className="text-4xl font-bold text-brand-primary italic">foodFlow</h1></Link>
                    <p className="text-gray-500 mt-2">Create your account. It's quick and easy.</p>
                </div>

                <ProgressBar currentStep={step} />

                <form onSubmit={handleSubmit}>
                    <div className="overflow-hidden relative">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="w-full grid gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputWithLabel name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} />
                                        <InputWithLabel name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} />
                                    </div>
                                    <InputWithLabel name="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputWithLabel name="password" label="Password" type="password" value={formData.password} onChange={handleChange} />
                                        <InputWithLabel name="confirmPassword" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange} />
                                    </div>
                                </motion.div>
                            )}
                            {step === 2 && (
                                <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="w-full grid gap-4">
                                    <div className="grid gap-2">
                                        <Label className="font-semibold text-gray-700">Phone Number</Label>
                                        <PhoneInput value={formData.phone} onChange={handlePhoneChange} className="custom-phone-input" required />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputWithLabel name="nickname" label="Address Nickname" value={formData.address.nickname} onChange={handleAddressChange} />
                                        <div className="grid gap-2">
                                            <Label className="font-semibold text-gray-700">Country</Label>
                                            <Select options={countryOptions} onChange={handleCountryChange} required styles={customSelectStyles} value={countryOptions.find(c => c.value === formData.address.country)}/>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputWithLabel name="city" label="City" value={formData.address.city} onChange={handleAddressChange} />
                                        <InputWithLabel name="postalCode" label="Postal Code" value={formData.address.postalCode} onChange={handleAddressChange} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2"><InputWithLabel name="street" label="Street" value={formData.address.street} onChange={handleAddressChange} /></div>
                                        <InputWithLabel name="streetNumber" label="Number" value={formData.address.streetNumber} onChange={handleAddressChange} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-4">
                        {/* Kontejner za grešku sada nema fiksnu visinu */}
                        <div className="min-h-[2.5rem] flex items-center">
                            {error && <div className="w-full bg-red-100/80 border border-red-300 text-red-800 p-2 rounded-lg flex items-center gap-2 text-sm"><AlertTriangle size={18}/><span>{error}</span></div>}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            {step > 1 ? (<Button type="button" variant="ghost" onClick={() => setStep(p => p - 1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>) : (<div></div>)}
                            <div className="flex-grow">
                                {step === 1 && (<Button type="button" onClick={handleNext} className="w-full bg-brand-primary text-white hover:bg-brand-primary/90 h-11">Next Step</Button>)}
                                {step === 2 && (<Button type="submit" disabled={isSubmitting} className="w-full bg-brand-primary text-white hover:bg-brand-primary/90 h-11">{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/><span>Registering...</span></> : 'Create Account'}</Button>)}
                            </div>
                        </div>
                    </div>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold underline text-brand-primary hover:text-brand-primary/90">Sign In</Link>
                </p>
            </motion.div>
        </main>
    );
}