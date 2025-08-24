// src/pages/SupportChatPage.jsx
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatInterface } from "@/components/ChatInterface";

export const SupportChatPage = () => {
  return (
    // Postavljamo visinu na ceo ekran i koristimo flexbox
    <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
      <Navbar />
      {/* `main` element se rasteže da popuni prostor, ali njegov sadržaj se ne skroluje */}
      <main className="container mx-auto px-4 md:px-6 py-8 flex-grow">
        <ChatInterface userRole="customer" />
      </main>
      <Footer />
    </div>
  );
};
