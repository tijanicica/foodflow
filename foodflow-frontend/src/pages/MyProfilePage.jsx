import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getMyProfile,
  deleteCard,
  updatePhoneNumber,
  setActiveCard,
} from "@/services/api";
import toast from "react-hot-toast";
import {
  Edit,
  Save,
  X,
  Trash2,
  CheckCircle2,
  User,
  KeyRound,
  MapPin,
  CreditCard,
  PlusCircle,
  Building,
  Home as HomeIcon,
  Briefcase,
} from "lucide-react";
import { AddNewAddressModal } from "@/components/modals/AddNewAddressModal";
import { AddNewCardModal } from "@/components/modals/AddNewCardModal";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import { EditAddressModal } from "@/components/modals/EditAddressModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

//================================================================================
// POMOĆNE KOMPONENTE (kompletne)
//================================================================================

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
    <div className="space-y-4">{children}</div>
  </motion.div>
);

const EmptyState = ({ message, onActionClick, actionLabel }) => (
  <div className="text-center py-12 px-6 bg-gray-50 rounded-lg border-2 border-dashed">
    <p className="text-gray-500">{message}</p>
    <Button
      onClick={onActionClick}
      className="mt-4 bg-brand-primary hover:bg-brand-primary/90"
    >
      <PlusCircle size={16} className="mr-2" /> {actionLabel}
    </Button>
  </div>
);

const AddressCard = ({ address, onEdit }) => {
  const icons = {
    HOME: <HomeIcon size={20} className="text-brand-primary" />,
    WORK: <Briefcase size={20} className="text-brand-primary" />,
    OTHER: <Building size={20} className="text-brand-primary" />,
  };
  const normalizedNickname = address.nickname?.toUpperCase() || "OTHER";
  const icon = icons[normalizedNickname] || icons.OTHER;

  return (
    <motion.div
      layout
      className="flex items-center gap-4 p-4 rounded-lg border bg-white transition-shadow hover:shadow-md"
    >
      <div className="bg-brand-background-light p-3 rounded-lg flex-shrink-0">
        {icon}
      </div>
      <div className="flex-grow">
        <p className="font-semibold text-gray-800">
          {address.nickname || "Address"}
        </p>
        <p className="text-sm text-gray-600 truncate">{address.fullAddress}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-400 hover:text-brand-primary h-9 w-9 flex-shrink-0"
        onClick={onEdit}
      >
        <Edit size={16} />
      </Button>
    </motion.div>
  );
};

const PaymentCard = ({ card, onSetActive, onCardDeleted }) => (
  <motion.div
    layout
    className={`flex justify-between items-center border p-4 rounded-lg transition-colors ${
      card.active ? "bg-green-50 border-green-300" : "bg-white hover:shadow-md"
    }`}
  >
    <div className="flex items-center gap-3">
      {card.active && <CheckCircle2 className="text-green-500 flex-shrink-0" />}
      <div>
        <span className="font-mono font-semibold text-gray-800">
          {card.maskedNumber}
        </span>
        <p className="text-xs text-gray-500">{card.cardType}</p>
      </div>
    </div>
    <div className="flex items-center gap-1">
      {!card.active && (
        <Button
          variant="link"
          className="p-1 h-auto text-sm text-brand-primary"
          onClick={onSetActive}
        >
          Set default
        </Button>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex="0">
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600 disabled:text-gray-400 disabled:cursor-not-allowed h-8 w-8"
                disabled={card.active}
                onClick={() =>
                  deleteCard(card.id).then(() => onCardDeleted(card.id))
                }
              >
                <Trash2 size={16} />
              </Button>
            </span>
          </TooltipTrigger>
          {card.active && (
            <TooltipContent>
              <p>Cannot delete the active card.</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  </motion.div>
);

const ProfilePageSkeleton = () => (
  <div className="w-full min-h-screen bg-[#F9F5EC]">
    <Navbar />
    <main className="container mx-auto px-4 py-12 animate-pulse">
      <div className="h-16 w-1/2 mx-auto bg-gray-200 rounded-lg mb-12"></div>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="h-48 bg-white rounded-2xl shadow-sm"></div>
        <div className="h-64 bg-white rounded-2xl shadow-sm"></div>
        <div className="h-64 bg-white rounded-2xl shadow-sm"></div>
      </div>
    </main>
    <Footer />
  </div>
);

//================================================================================
// GLAVNA KOMPONENTA STRANICE
//================================================================================

export function MyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phone, setPhone] = useState("");
  const [editingAddress, setEditingAddress] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
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
    if (phone === profile?.phone) return setIsEditingPhone(false);
    try {
      await updatePhoneNumber(phone);
      toast.success("Phone number updated!");
      await fetchProfile();
      setIsEditingPhone(false);
    } catch {
      toast.error("Failed to update phone number.");
    }
  };

  const handleCardDeleted = (cardId) => {
    setProfile((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter((card) => card.id !== cardId),
    }));
    toast.success("Card removed successfully.");
  };

  const handleSetActiveCard = async (cardId) => {
    try {
      await setActiveCard(cardId);
      fetchProfile();
      toast.success("Default card updated!");
    } catch {
      toast.error("Failed to update card.");
    }
  };

  const handleAddressChange = () => {
    fetchProfile();
    setModalOpen(null);
    setEditingAddress(null);
  };

  if (loading) return <ProfilePageSkeleton />;
  if (!profile) return <div>Could not load profile data.</div>;

  return (
    <>
      <div className="w-full min-h-screen bg-[#F9F5EC] flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-12 flex-grow">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-[#4A4A4A]">
              Account Settings
            </h1>
            <p className="text-lg text-gray-500 mt-1">
              Manage your personal details and preferences.
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

            <ProfileSection
              title="Saved Addresses"
              icon={<MapPin size={24} />}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen("address")}
                >
                  <PlusCircle size={16} className="mr-2" /> Add New
                </Button>
              }
            >
              <div className="border-t pt-4 space-y-3">
                {(profile?.savedAddresses || []).length > 0 ? (
                  profile.savedAddresses.map((address) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      onEdit={() => {
                        setEditingAddress(address);
                        setModalOpen("editAddress");
                      }}
                    />
                  ))
                ) : (
                  <EmptyState
                    message="You have no saved addresses."
                    actionLabel="Add First Address"
                    onActionClick={() => setModalOpen("address")}
                  />
                )}
              </div>
            </ProfileSection>

            <ProfileSection
              title="Payment Methods"
              icon={<CreditCard size={24} />}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen("card")}
                >
                  <PlusCircle size={16} className="mr-2" /> Add New Card
                </Button>
              }
            >
              <div className="border-t pt-4 space-y-3">
                {(profile?.paymentMethods || []).length > 0 ? (
                  profile.paymentMethods.map((card) => (
                    <PaymentCard
                      key={card.id}
                      card={card}
                      onSetActive={() => handleSetActiveCard(card.id)}
                      onCardDeleted={handleCardDeleted}
                    />
                  ))
                ) : (
                  <EmptyState
                    message="You have no saved payment methods."
                    actionLabel="Add First Card"
                    onActionClick={() => setModalOpen("card")}
                  />
                )}
              </div>
            </ProfileSection>

            <ProfileSection title="Security" icon={<KeyRound size={24} />}>
              <div className="border-t pt-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">Password</p>
                    {profile.passwordLastChanged && (
                      <p className="text-sm text-gray-500 mt-1">
                        Last changed: {profile.passwordLastChanged}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setModalOpen("password")}
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

      <AddNewAddressModal
        isOpen={modalOpen === "address"}
        onClose={() => setModalOpen(null)}
        onAddressAdded={handleAddressChange}
      />
      <AddNewCardModal
        isOpen={modalOpen === "card"}
        onClose={() => setModalOpen(null)}
        onCardAdded={fetchProfile}
      />
      <ChangePasswordModal
        isOpen={modalOpen === "password"}
        onClose={() => setModalOpen(null)}
      />
      {editingAddress && (
        <EditAddressModal
          isOpen={modalOpen === "editAddress"}
          onClose={() => {
            setModalOpen(null);
            setEditingAddress(null);
          }}
          onAddressUpdated={handleAddressChange}
          addressData={editingAddress}
        />
      )}
    </>
  );
}
