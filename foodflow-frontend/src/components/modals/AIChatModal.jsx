import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage } from '@/services/api'; // <-- 1. Uvozimo novu API funkciju
import toast from 'react-hot-toast';

const Message = ({ message }) => {
    const isUser = message.sender === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white">
                    <Sparkles size={16} />
                </div>
            )}
            <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${isUser ? 'bg-brand-primary text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }}></p>
            </div>
            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    <User size={16} />
                </div>
            )}
        </div>
    );
};

export const AIChatModal = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your AI Food Concierge. Ask me for recommendations, like 'cheap pizza' or 'vegan options'.", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    // === KLJUČNA IZMENA JE OVDE ===
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const userMessage = inputValue.trim();
        if (!userMessage) return;

        setMessages(prev => [...prev, { id: Date.now(), text: userMessage, sender: 'user' }]);
        setInputValue('');
        setIsTyping(true);

        try {
            // 2. Pozivamo pravi API endpoint
            const response = await sendChatMessage(userMessage);
            const botResponse = response.reply; // Pretpostavka da backend vraća { "reply": "..." }

            // 3. Dodajemo odgovor bota u listu poruka
            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
        } catch (error) {
            // U slučaju greške, obavesti korisnika
            toast.error("Sorry, I couldn't get a response. Please try again.");
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "I'm having trouble connecting right now. Please try again in a moment.", sender: 'bot' }]);
        } finally {
            // 4. Uvek isključujemo "typing" indikator
            setIsTyping(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full h-full sm:h-[70vh] sm:max-h-[600px] sm:w-[400px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col"
        >
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                    <Sparkles className="text-brand-primary" />
                    <h3 className="font-bold text-lg text-brand-primary">AI Food Concierge</h3>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}><X size={20} /></Button>
            </div>
            
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map(msg => <Message key={msg.id} message={msg} />)}
                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-none">
                            <div className="flex items-center gap-1">
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
                <div className="relative">
                    <Input 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask for recommendations..." 
                        className="h-12 rounded-full pr-14"
                        disabled={isTyping}
                    />
                    <Button type="submit" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full h-10 w-10 bg-brand-primary" disabled={isTyping || !inputValue}>
                        <Send size={20}/>
                    </Button>
                </div>
            </form>
        </motion.div>
    );
};