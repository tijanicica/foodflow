// src/components/modals/ChangePasswordModal.jsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import zxcvbn from "zxcvbn";
import { motion } from "framer-motion";

const PasswordInput = ({ id, value, onChange }) => {
  const [showPass, setShowPass] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={showPass ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShowPass(!showPass)}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
      >
        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

const PasswordStrengthIndicator = ({ password }) => {
  const result = zxcvbn(password);
  const score = result.score;

  const strengthLevels = [
    { label: "Very Weak", color: "bg-red-500", width: "w-1/5" },
    { label: "Weak", color: "bg-orange-500", width: "w-2/5" },
    { label: "Medium", color: "bg-yellow-500", width: "w-3/5" },
    { label: "Strong", color: "bg-green-400", width: "w-4/5" },
    { label: "Very Strong", color: "bg-green-600", width: "w-full" },
  ];

  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-2">
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <motion.div
          className={`h-1.5 rounded-full ${strengthLevels[score].color}`}
          initial={{ width: 0 }}
          animate={{ width: strengthLevels[score].width }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-xs font-semibold text-gray-500">
        {strengthLevels[score].label}
      </p>
    </div>
  );
};

export const ChangePasswordModalGeneric = ({ isOpen, onClose, onSubmit }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  }, [isOpen]);

  const handleSave = async () => {
    //Validacija
    if (newPassword !== confirmPassword) {
      setErrors({ server: "New passwords do not match." });
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      await onSubmit({
        oldPassword: oldPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });
      onClose();
    } catch (error) {
      const errorMessage = error.message || "An unknown error occurred.";
      setErrors({ server: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Change Your Password</DialogTitle>
          <DialogDescription>
            Enter your old password and create a new, strong password.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {errors.server && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md flex items-center gap-2">
              <AlertCircle size={16} /> {errors.server}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="oldPass">Current Password</Label>
            <PasswordInput
              id="oldPass"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPass">New Password</Label>
            <PasswordInput
              id="newPass"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <PasswordStrengthIndicator password={newPassword} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPass">Confirm New Password</Label>
            <PasswordInput
              id="confirmPass"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {newPassword &&
              confirmPassword &&
              newPassword !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  Passwords do not match.
                </p>
              )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-brand-primary hover:bg-brand-primary/90 w-32"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
