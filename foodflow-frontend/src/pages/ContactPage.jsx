import React from "react";
import { DynamicNavbar } from "@/components/DynamicNavbar";
import { Footer } from "@/components/Footer";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export const ContactPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Thank you for your message! We'll get back to you shortly.");
    e.target.reset();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F5EC]">
      <DynamicNavbar />
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Mail className="mx-auto h-16 w-16 text-[#D4A056]" />
            <h1 className="text-5xl font-bold text-[#4A4A4A] mt-4">
              Contact Us
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              We'd love to hear from you!
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input type="text" placeholder="Your Name" required />
                <Input type="email" placeholder="Your Email" required />
              </div>
              <Input type="text" placeholder="Subject" required />
              <Textarea placeholder="Your Message" rows={6} required />
              <div className="text-right">
                <Button type="submit" className="bg-brand-primary">
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
