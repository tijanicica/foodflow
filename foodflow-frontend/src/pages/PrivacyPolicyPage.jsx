import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPolicyPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9F5EC]">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <ShieldCheck className="mx-auto h-16 w-16 text-[#D4A056]" />
            <h1 className="text-5xl font-bold text-[#4A4A4A] mt-4">Privacy Policy</h1>
            <p className="mt-2 text-gray-500">Last updated: August 14, 2025</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md space-y-6 text-gray-700 leading-relaxed">
            <p className="text-sm text-red-600 font-bold">
              IMPORTANT: This is a template document and not legal advice. Consult with a legal professional for your specific needs.
            </p>
            
            <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-800">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you create an account, place an order, or contact customer support. This information may include your name, email address, phone number, delivery address, and payment information.</p>
            </section>
            
            <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-800">2. How We Use Your Information</h2>
                <p>We use the information we collect to: provide, maintain, and improve our services; process transactions and send you related information, including confirmations and invoices; communicate with you about products, services, offers, and provide customer support.</p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-800">3. Sharing of Information</h2>
                <p>We may share your information with restaurants and drivers to facilitate your orders. We share only the necessary information required to fulfill the service, such as your name for the order and your delivery address for the driver.</p>
            </section>

             <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-800">4. Data Security</h2>
                <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};