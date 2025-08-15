import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FileText } from 'lucide-react';

export const TermsOfServicePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9F5EC]">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <FileText className="mx-auto h-16 w-16 text-[#D4A056]" />
            <h1 className="text-5xl font-bold text-[#4A4A4A] mt-4">Terms of Service</h1>
            <p className="mt-2 text-gray-500">Effective date: August 14, 2025</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md space-y-6 text-gray-700 leading-relaxed">
             <p className="text-sm text-red-600 font-bold">
              IMPORTANT: This is a template document and not legal advice. Consult with a legal professional for your specific needs.
            </p>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-800">1. Acceptance of Terms</h2>
                <p>By accessing or using the FoodFlow service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.</p>
            </section>
            
            <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-800">2. User Accounts</h2>
                <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.</p>
            </section>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-800">3. Orders</h2>
                <p>By placing an order through FoodFlow, you agree to pay for all charges, including the price of the items, delivery fees, and applicable taxes. All sales are final and non-refundable once the restaurant has started preparing the food.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};