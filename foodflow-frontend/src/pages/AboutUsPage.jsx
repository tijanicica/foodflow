import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Utensils } from 'lucide-react';

export const AboutUsPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9F5EC]">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Utensils className="mx-auto h-16 w-16 text-[#D4A056]" />
            <h1 className="text-5xl font-bold text-[#4A4A4A] mt-4">About FoodFlow</h1>
            <p className="mt-4 text-xl text-gray-600">Connecting you to the best local flavors.</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md space-y-6 text-lg text-gray-700">
            <p>
              Welcome to <span className="font-bold italic text-[#D4A056]">FoodFlow</span>, your premium destination for discovering and ordering from the finest local restaurants. 
              Our mission is simple: to bring delicious, high-quality meals right to your doorstep with ease and reliability.
            </p>
            <p>
              Founded in 2025, we saw an opportunity to bridge the gap between talented local chefs and hungry customers looking for exceptional dining experiences at home. We partner with a curated selection of restaurants to ensure that every meal you order meets our high standards of quality and taste.
            </p>
            <p>
              Whether you're craving a quick lunch, a gourmet dinner, or planning a repeating weekly meal, our platform is designed to make your experience seamless and enjoyable. Thank you for choosing FoodFlow.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};