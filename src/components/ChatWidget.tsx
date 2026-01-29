'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage, { TypingIndicator } from './ChatMessage';

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: string;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load initial greeting
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    role: 'ai',
                    content: "Hi! I'm **Xplore AI**. I can help you understand your roadmap or explain any tech concept. What's on your mind?",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        }
    }, [messages.length]);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, isOpen]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        try {
            // Prepare history for backend (limit to last 10 messages to save tokens)
            const history = messages.slice(-10).map(m => ({
                role: m.role,
                content: m.content
            }));

            const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');
            const response = await fetch(`${backendUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    history: history
                })
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Server busy (High Traffic). Please try again in 1 minute.');
                }
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            const aiMessage: Message = {
                role: 'ai',
                content: data.response,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                role: 'ai',
                content: error instanceof Error ? error.message : "I'm having trouble connecting. Please try again.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        if (confirm("Clear conversation history?")) {
            setMessages([
                {
                    role: 'ai',
                    content: "Chat cleared. fresh start! How can I help?",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-xl shadow-blue-500/30 text-white flex items-center justify-center group"
                >
                    <div className="absolute inset-0 rounded-full animate-ping bg-blue-500 opacity-20"></div>
                    <Sparkles className="w-6 h-6 animate-pulse" />
                    <span className="absolute right-full mr-4 bg-white dark:bg-black px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-gray-100 dark:border-white/10 text-gray-800 dark:text-white pointer-events-none">
                        Ask Xplore AI
                    </span>
                </motion.button>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className={`fixed ${isExpanded ? 'inset-4 md:inset-10' : 'bottom-6 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh]'} z-50 flex flex-col glass-panel rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl overflow-hidden`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-1.5 shadow-lg">
                                    <Sparkles className="w-full h-full text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Xplore AI</h3>
                                    <p className="text-xs text-blue-500 font-medium">Mentor & Code Expert</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500">
                                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>
                                <button onClick={clearChat} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-gray-500" title="Clear Chat">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
                            {messages.map((msg, idx) => (
                                <ChatMessage key={idx} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
                            ))}
                            {isLoading && <TypingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5">
                            <div className="relative flex items-end gap-2 p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus-within:border-blue-400/50 focus-within:ring-2 focus-within:ring-blue-400/20 transition-all">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about roadmaps, tech stacks..."
                                    className="w-full bg-transparent border-none focus:ring-0 p-2 min-h-[44px] max-h-[150px] resize-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400"
                                    rows={1}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className={`p-2.5 rounded-lg mb-0.5 transition-all ${input.trim() && !isLoading
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95'
                                        : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[10px] text-center mt-2 opacity-50">
                                AI can make mistakes. Please verify important information.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
