// src/pages/SupportAdminProfilePage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { SupportAdminNavbar } from "@/components/SupportAdminNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getSupportAdminProfile,
  updateSupportAdminPhone,
  changeSupportAdminPassword,
} from "@/services/api";
import toast from "react-hot-toast";
import { Edit, Save, X, User, KeyRound } from "lucide-react";
import { ChangePasswordModalGeneric } from "@/components/modals/ChangePasswordModalGeneric";
import { motion } from "framer-motion";

const ProfileSection = ({ title, icon, action, children }) => (
  <motion.div
    className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="bg-brand-background-light p-3 rounded-lg text-brand-primary">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      {action}
    </div>
    <div>{children}</div>
  </motion.div>
);

const ProfilePageSkeleton = () => (
  <div className="w-full min-h-screen bg-brand-background-light">
    <SupportAdminNavbar />
    <main className="container mx-auto px-4 py-12 animate-pulse">
      <div className="h-16 w-1/2 mx-auto bg-gray-200 rounded-lg mb-12"></div>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="h-48 bg-white rounded-2xl shadow-sm"></div>
        <div className="h-32 bg-white rounded-2xl shadow-sm"></div>
      </div>
    </main>
    <Footer />
  </div>
);

export const SupportAdminProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phone, setPhone] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getSupportAdminProfile();
      const fullName = `${data.firstName} ${data.lastName}`;
      setProfile({ ...data, fullName });
      setPhone(data.phone || "");
    } catch {
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handlePhoneSave = async () => {
    if (phone === profile?.phone) {
      setIsEditingPhone(false);
      return;
    }
    try {
      await updateSupportAdminPhone(phone);
      toast.success("Phone number updated!");
      await fetchProfile();
      setIsEditingPhone(false);
    } catch {
      toast.error("Failed to update phone number.");
    }
  };

  const handlePasswordChange = async (passwordData) => {
    try {
      await changeSupportAdminPassword(passwordData);
      toast.success("Password changed successfully!");
      setPasswordModalOpen(false);
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to change password."
      );
    }
  };

  if (loading) return <ProfilePageSkeleton />;
  if (!profile)
    return <div>Could not load profile data. Please refresh the page.</div>;

  return (
    <>
      <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
        <SupportAdminNavbar />
        <main className="container mx-auto px-4 py-12 flex-grow">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-brand-primary">
              Account Settings
            </h1>
            <p className="text-lg text-gray-500 mt-1">
              Manage your administrator details and preferences.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <ProfileSection
              title="Personal Information"
              icon={<User size={24} />}
            >
              <div className="border-t pt-4">
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500">Full Name</span>
                  <span className="font-semibold text-gray-800">
                    {profile.fullName}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500">Email</span>
                  <span className="font-semibold text-gray-800">
                    {profile.email}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500">Phone Number</span>
                  {isEditingPhone ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="max-w-xs h-9"
                      />
                      <Button
                        size="icon"
                        onClick={handlePhoneSave}
                        className="bg-green-600 hover:bg-green-700 h-9 w-9"
                      >
                        <Save size={16} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsEditingPhone(false)}
                        className="h-9 w-9"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">
                        {profile.phone || "Not set"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-brand-primary h-8 w-8"
                        onClick={() => setIsEditingPhone(true)}
                      >
                        <Edit size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </ProfileSection>

            <ProfileSection title="Security" icon={<KeyRound size={24} />}>
              <div className="border-t pt-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">Password</p>
                    <p className="text-sm text-gray-500 mt-1">
                      It's a good practice to use a strong password.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPasswordModalOpen(true)}
                    className="flex-shrink-0"
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </ProfileSection>
          </div>
        </main>
        <Footer />
      </div>

      <ChangePasswordModalGeneric
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handlePasswordChange}
      />
    </>
  );
};
