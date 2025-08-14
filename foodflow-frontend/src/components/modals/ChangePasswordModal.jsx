import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { changePassword } from '@/services/api';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!oldPassword) newErrors.oldPassword = "Old password is required.";
        if (!newPassword) newErrors.newPassword = "New password is required.";
        if (newPassword.length > 0 && newPassword.length < 6) newErrors.newPassword = "Must be at least 6 characters.";
        if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        
        setIsSaving(true);
        setErrors({});
        
        try {
            await changePassword({ oldPassword, newPassword, confirmPassword });
            toast.success("Password changed successfully!");
            onClose();
        } catch (error) {
            const errorMessage = error.response?.data?.message || "An unknown error occurred.";
            setErrors({ oldPassword: errorMessage });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleClose = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
        setShowPass(false); // Resetuj i prikaz lozinke
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                       <DialogDescription>
                        Enter your old password and a new one. Click save to apply changes.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="oldPass">Old Password</Label>
                        <Input id="oldPass" type={showPass ? 'text' : 'password'} value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
                        {errors.oldPassword && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/> {errors.oldPassword}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPass">New Password</Label>
                        <Input id="newPass" type={showPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                         {errors.newPassword && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/> {errors.newPassword}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPass">Confirm New Password</Label>
                        <Input id="confirmPass" type={showPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                        {errors.confirmPassword && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/> {errors.confirmPassword}</p>}
                    </div>
                    {/* === NOVI DEO ZA PRIKAZ LOZINKE === */}
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setShowPass(!showPass)} className="flex items-center text-sm text-gray-600 hover:text-black">
                            {showPass ? <EyeOff size={16} className="mr-2"/> : <Eye size={16} className="mr-2"/>}
                            <span>{showPass ? 'Hide' : 'Show'} password</span>
                        </button>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};