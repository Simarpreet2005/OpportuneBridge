import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Send, Sparkles, MessageSquare, User, Bot } from 'lucide-react';
import { CAREER_ASSISTANT_API_END_POINT } from '../utils/constant';
import api from '../services/api';
import { toast } from 'sonner';

const CareerAssistant = () => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suggestedPrompts, setSuggestedPrompts] = useState([]);

    useEffect(() => {
        fetchSuggestedPrompts();
    }, []);

    const fetchSuggestedPrompts = async () => {
        try {
            const res = await api.get(`${CAREER_ASSISTANT_API_END_POINT}/suggested-prompts`);
            if (res.data.success) {
                setSuggestedPrompts(res.data.data?.prompts ?? res.data.prompts ?? []);
            }
        } catch (error) {
            console.error('Error fetching suggested prompts:', error);
            // Set default prompts as fallback
            setSuggestedPrompts([
                "How can I improve my resume?",
                "What skills should I learn for my career growth?",
                "Interview questions for technical roles",
                "How to prepare for job interviews?"
            ]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMessage = { role: 'user', content: query };
        setMessages(prev => [...prev, userMessage]);
        setQuery('');
        setLoading(true);

        try {
            const res = await api.post(
                `${CAREER_ASSISTANT_API_END_POINT}/advice`,
                { query }
            );

            if (res.data.success) {
                const advice = res.data.data?.advice;
                const assistantMessage = { 
                    role: 'assistant', 
                    content: advice?.content ?? "Sorry, I couldn't generate advice. Please try again.",
                    type: advice?.type
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                toast.error(res.data.message);
                setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
            }
        } catch (error) {
            const errorMsg = error.message === "Career Assistant temporarily unavailable"
                ? "Career Assistant unavailable. Please try again later."
                : (error.message || "Sorry, I encountered an error. Please try again.");
            toast.error(errorMsg);
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestedPrompt = (prompt) => {
        setQuery(prompt);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card className="h-[700px] flex flex-col">
                <CardHeader className="border-b">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-primary" />
                        <CardTitle>Career Assistant</CardTitle>
                    </div>
                    <CardDescription>
                        Get personalized career guidance, resume tips, skill recommendations, and interview preparation advice
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0">
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center py-8">
                                    <Bot className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Welcome to Career Assistant</h3>
                                    <p className="text-muted-foreground mb-6">
                                        I can help you with resume improvement, skill development, interview preparation, and career guidance.
                                    </p>
                                    
                                    {suggestedPrompts.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground">Try asking:</p>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {suggestedPrompts.map((prompt, index) => (
                                                    <Button
                                                        key={index}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSuggestedPrompt(prompt)}
                                                        className="text-xs"
                                                    >
                                                        {prompt}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    
                                    <div
                                        className={`max-w-[80%] rounded-lg p-4 overflow-x-auto break-words ${
                                            message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                        }`}
                                    >
                                        <div className="whitespace-pre-wrap text-sm break-words">{message.content}</div>
                                    </div>

                                    {message.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-secondary-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-muted rounded-lg p-4">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t p-4">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ask about resume, skills, interviews, or career guidance..."
                                className="flex-1"
                                disabled={loading}
                            />
                            <Button type="submit" disabled={loading || !query.trim()}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                        <p className="text-xs text-muted-foreground mt-2">
                            I only answer career-related questions. Questions about other topics will be declined.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CareerAssistant;
