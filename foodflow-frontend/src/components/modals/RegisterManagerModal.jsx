// Kreiraj src/components/modals/RegisterManagerModal.jsx
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function RegisterManagerModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-brand-background-light p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-brand-primary mb-6 text-center">Register New Manager</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {Object.entries(formData).map(([key, value]) => (
                        <div key={key}>
                            <Label htmlFor={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                            <Input id={key} name={key} type={key.includes('password') ? 'password' : 'text'} value={value} onChange={handleChange} required className="bg-white" />
                        </div>
                    ))}
                    <div className="flex justify-center gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="w-full">Cancel</Button>
                        <Button type="submit" className="w-full">Register Manager</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}