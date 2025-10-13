// src/pages/AdminChatViewPage.jsx
import React from "react";
import { SupportAdminNavbar } from "@/components/SupportAdminNavbar";
import { Footer } from "@/components/Footer";
import { ChatInterface } from "@/components/ChatInterface";

export const AdminChatViewPage = () => {
  return (
    <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
      <SupportAdminNavbar />
      <main className="container mx-auto px-4 md:px-6 py-8 flex-grow">
        {/*
          Ključna izmena: prosleđujemo userRole="support_administrator".
          Ovo će omogućiti ChatInterface komponenti da zna ko je korisnik.
        */}
        <ChatInterface userRole="support_administrator" />
      </main>
      <Footer />
    </div>
  );
};
