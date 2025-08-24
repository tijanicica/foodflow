// src/pages/OperatorChatPage.jsx
import { OperatorNavbar } from "@/components/OperatorNavbar";
import { Footer } from "@/components/Footer";
import { ChatInterface } from "@/components/ChatInterface";

export const OperatorChatPage = () => {
  return (
    // Ista struktura
    <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
      <OperatorNavbar />
      <main className="container mx-auto px-4 md:px-6 py-8 flex-grow ">
        <ChatInterface userRole="operator" />
      </main>
      <Footer />
    </div>
  );
};
