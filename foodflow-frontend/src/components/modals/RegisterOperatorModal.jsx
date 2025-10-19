// src/components/modals/RegisterAgentModal.jsx

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { registerOperator } from "@/services/api";
import toast from "react-hot-toast";

// Problem categories - idealno bi bilo fetch-ovati sa backend-a
const PROBLEM_CATEGORIES = [
  { id: 1, name: "Order problem", parentCategoryId: null },
  { id: 2, name: "Delivery problem", parentCategoryId: null },
  { id: 3, name: "Technical problem", parentCategoryId: null },
  { id: 4, name: "Other", parentCategoryId: null },
  { id: 5, name: "Incomplete order", parentCategoryId: 1 },
  { id: 6, name: "Wrong order", parentCategoryId: 1 },
  { id: 7, name: "Damaged food/packaging", parentCategoryId: 1 },
  { id: 8, name: "Cold/spoiled food", parentCategoryId: 1 },
  { id: 9, name: "Undeclared allergens", parentCategoryId: 1 },
  { id: 10, name: "Undeclared diet type", parentCategoryId: 1 },
  { id: 11, name: "Delivery delay", parentCategoryId: 2 },
  { id: 12, name: "Order not delivered", parentCategoryId: 2 },
  { id: 13, name: "Problem with delivery person", parentCategoryId: 2 },
  { id: 14, name: "Website problem", parentCategoryId: 3 },
];

export const RegisterAgentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSpecializationToggle = (categoryId) => {
    setSelectedSpecializations((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedSpecializations.length === 0) {
      toast.error("Please select at least one specialization");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        specializations: selectedSpecializations.map((id) => ({ id })),
      };
      await registerOperator(payload);
      toast.success("Agent successfully registered!");
      onSuccess();
      handleClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to register agent.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    });
    setSelectedSpecializations([]);
    onClose();
  };

  // Organizuj kategorije po parent-child strukturi
  const parentCategories = PROBLEM_CATEGORIES.filter(
    (cat) => !cat.parentCategoryId
  );
  const getSubCategories = (parentId) =>
    PROBLEM_CATEGORIES.filter((cat) => cat.parentCategoryId === parentId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold text-brand-primary">
            Register New Agent
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new support agent account.
          </DialogDescription>
        </DialogHeader>
        <div onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                First Name
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="col-span-3"
                required
                autoComplete="family-name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="col-span-3"
                required
                autoComplete="tel"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="col-span-3"
                required
                autoComplete="email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                minLength="6"
                value={formData.password}
                onChange={handleChange}
                className="col-span-3"
                required
                autoComplete="new-password"
              />
            </div>

            {/* Specializations Section */}
            <div className="border-t pt-4 mt-2">
              <Label className="text-base font-semibold mb-3 block">
                Specializations *
              </Label>
              <div className="space-y-4 ml-4">
                {parentCategories.map((parent) => {
                  const subCats = getSubCategories(parent.id);
                  return (
                    <div key={parent.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${parent.id}`}
                          checked={selectedSpecializations.includes(parent.id)}
                          onCheckedChange={() =>
                            handleSpecializationToggle(parent.id)
                          }
                        />
                        <label
                          htmlFor={`cat-${parent.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {parent.name}
                        </label>
                      </div>
                      {subCats.length > 0 && (
                        <div className="ml-6 space-y-2">
                          {subCats.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`cat-${sub.id}`}
                                checked={selectedSpecializations.includes(
                                  sub.id
                                )}
                                onCheckedChange={() =>
                                  handleSpecializationToggle(sub.id)
                                }
                              />
                              <label
                                htmlFor={`cat-${sub.id}`}
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {sub.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-brand-primary hover:bg-brand-primary/90"
              onClick={handleSubmit}
            >
              {isLoading ? "Registering..." : "Register Agent"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
