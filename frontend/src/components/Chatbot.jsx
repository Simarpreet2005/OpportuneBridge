import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { role: "model", parts: [{ text: "Hi! I'm your AI career assistant. How can I help you today?" }] }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMessage = { role: "user", parts: [{ text: message }] };
        setChatHistory([...chatHistory, userMessage]);
        setMessage("");
        setIsLoading(true);

        try {
            const historyToSend = chatHistory.slice(1).map(item => ({ role: item.role, parts: item.parts }));
            const res = await axios.post(`http://localhost:8000/api/v1/aichat/chat`, {
                message,
                history: historyToSend
            }, { withCredentials: true });

            if (res.data.success) {
                setChatHistory(prev => [...prev, { role: "model", parts: [{ text: res.data.reply }] }]);
            }
        } catch (error) {
            console.error(error);
            setChatHistory(prev => [...prev, { role: "model", parts: [{ text: "Sorry, I'm having trouble connecting right now." }] }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col mb-4 overflow-hidden"
                    >
                        <div className="bg-[#1E3A8A] p-4 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                <span className="font-bold">Career AI</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div ref={scrollRef} className="h-96 p-4 overflow-y-auto space-y-4 bg-gray-50">
                            {chatHistory.map((item, index) => (
                                <div key={index} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${item.role === 'user' ? 'bg-[#1E3A8A] text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none'}`}>
                                        {item.parts[0].text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border p-3 rounded-2xl rounded-tl-none">
                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ask about jobs, salaries..."
                                className="flex-1"
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !message.trim()} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="icon"
                className="w-14 h-14 rounded-full shadow-lg bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 transition-all transform hover:scale-110"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </Button>
        </div>
    );
};

export default Chatbot;
