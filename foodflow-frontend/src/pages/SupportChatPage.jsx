// src/pages/SupportChatPage.jsx

import React from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MessageCircle } from 'lucide-react';

export const SupportChatPage = () => {
    // Dohvatamo ID tiketa iz URL-a
    const { ticketId } = useParams();

    return (
        <div className="w-full min-h-screen bg-brand-background-light flex flex-col">
            <Navbar />
            <main className="container mx-auto px-4 md:px-6 py-12 flex-grow">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-brand-background-light p-3 rounded-lg text-brand-primary">
                            <MessageCircle size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Support Chat</h1>
                    </div>
                    
                    <div className="text-center py-16">
                        <p className="text-lg text-gray-600">
                            You are now in the chat for ticket #{ticketId}.
                        </p>
                        <p className="text-gray-500 mt-2">
                            An operator will be with you shortly. The chat interface is coming soon!
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};