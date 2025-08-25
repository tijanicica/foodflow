import React from "react";
import { DynamicNavbar } from "@/components/DynamicNavbar";
import { Footer } from "@/components/Footer";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    q: "How do I place an order?",
    a: "Simply browse restaurants on our homepage, select a menu, add items to your cart, and proceed to checkout. You'll be guided through the process step-by-step.",
  },
  {
    q: "Can I order from multiple restaurants at once?",
    a: "Currently, our system supports ordering from one restaurant at a time to ensure delivery efficiency and food quality. To order from another restaurant, please complete your current order first.",
  },
  {
    q: "How can I track my order?",
    a: "Once your order is picked up by a driver, a 'Track on map' button will appear for that order in the 'Active' tab of your 'My Orders' page.",
  },
  {
    q: "What are repeating orders?",
    a: "Repeating orders allow you to set up a recurring delivery for your favorite meals on a weekly or monthly basis. You can set it up during checkout and manage your templates on the 'My Orders' page.",
  },
];

export const FaqPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9F5EC]">
      <DynamicNavbar />
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="mx-auto h-16 w-16 text-[#D4A056]" />
            <h1 className="text-5xl font-bold text-[#4A4A4A] mt-4">
              Frequently Asked Questions
            </h1>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg font-semibold text-left">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-gray-600">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
