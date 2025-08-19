import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, User, AtSign, Phone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../PhoneNumberInput.css';

import { AddressSearchMap } from '../AddressSearchMap';
import { registerDriver } from '@/services/api';

// Pomoćna komponenta za input polja sa ikonicom
const FormInput = ({ icon: Icon, name, type = 'text', placeholder, onChange, required, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{placeholder}</label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon className="h-5 w-5 text-gray-400" />
            </span>
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                onChange={onChange}
                required={required}
                className={`w-full pl-10 pr-3 py-2 border rounded-md transition duration-150 ease-in-out ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

export const RegisterDriverModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [phone, setPhone] = useState();
    const [location, setLocation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const validateForm = () => { /* ... (bez izmena) ... */ };
    const handleSubmit = async (e) => { /* ... (bez izmena) ... */ };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 30 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-[#FDFCF8] rounded-2xl shadow-2xl w-full max-w-6xl h-[75vh] p-8 relative flex gap-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10">
                            <X size={24} />
                        </button>
                        
                        {/* === LEVA STRANA: FORMA === */}
                        <div className="w-1/2 flex flex-col pt-8">
                            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Create Driver Profile</h2>
                            <p className="text-gray-500 mb-8">Fill in the details to register a new driver.</p>
                            
                            <form onSubmit={handleSubmit} className="flex flex-col flex-grow space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <FormInput icon={User} name="firstName" placeholder="First Name" onChange={handleInputChange} required error={errors.firstName} />
                                    <FormInput icon={User} name="lastName" placeholder="Last Name" onChange={handleInputChange} required error={errors.lastName} />
                                </div>

                                <FormInput icon={AtSign} name="email" type="email" placeholder="Email Address" onChange={handleInputChange} required error={errors.email} />
                                
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 z-10">
                                                <Phone className="h-5 w-5 text-gray-400" />
                                            </span>
                                            <PhoneInput
                                                placeholder="Enter phone number"
                                                value={phone}
                                                onChange={setPhone}
                                                defaultCountry="RS"
                                                className={`input-style-phone ${errors.phone ? 'input-error' : ''}`}
                                            />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </span>
                                            <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" onChange={handleInputChange} required className={`w-full pl-10 pr-10 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                    </div>
                                </div>

                                <div className="mt-auto pt-8">
                                    <button type="submit" disabled={isSubmitting} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-400 shadow-lg hover:shadow-yellow-500/50">
                                        {isSubmitting ? 'Registering...' : 'Complete Registration'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* === DESNA STRANA: MAPA === */}
                        <div className="w-1/2 flex flex-col bg-gray-50 p-6 rounded-xl">
                            <label className="block text-lg font-bold text-gray-800 mb-1">
                                Set Initial Location
                            </label>
                             <p className="text-gray-500 mb-4">Search for an address or drag the pin to the exact spot.</p>
                            <div className="flex-grow w-full rounded-lg overflow-hidden border-2 border-gray-200 shadow-inner">
                                <AddressSearchMap onLocationSelect={setLocation} />
                            </div>
                            {location && (
                                <div className="mt-4 text-sm p-3 bg-green-100 text-green-800 rounded-md font-medium">
                                    Location Confirmed: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};