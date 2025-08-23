// Kreirajte novi fajl src/pages/OperatorChatPage.jsx
import { OperatorNavbar } from "@/components/OperatorNavbar";
import { Footer } from "@/components/Footer";
import { ChatInterface } from "@/components/ChatInterface";

export const OperatorChatPage = () => {
  return (
    <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
      <OperatorNavbar />
      <main className="container mx-auto px-4 py-12 flex-grow">
        <ChatInterface userRole="operator" />
      </main>
      <Footer />
    </div>
  );
};
