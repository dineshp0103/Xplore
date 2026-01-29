'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface ChatMessageProps {
    role: 'user' | 'ai';
    content: string;
    timestamp?: string;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
    const isAi = role === 'ai';
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 mb-6 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}
        >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAi ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20' : 'bg-gray-200 dark:bg-white/10'
                }`}>
                {isAi ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-gray-600 dark:text-white/80" />}
            </div>

            {/* Message Bubble */}
            <div className={`flex flex-col max-w-[85%] ${isAi ? 'items-start' : 'items-end'}`}>
                <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isAi
                    ? 'bg-white dark:bg-black/40 border border-gray-100 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                    : 'bg-blue-600 text-white rounded-tr-sm shadow-blue-500/10'
                    }`}>



                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            pre: ({ children }) => <>{children}</>,
                            code({ node, inline, className, children, ...props }: any) {
                                return !inline ? (
                                    <div className="relative my-4 rounded-lg overflow-hidden bg-black/80 border border-white/5">
                                        <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5">
                                            <span className="text-xs text-gray-400 font-mono">code</span>
                                        </div>
                                        <div className="p-3 overflow-x-auto text-gray-200 font-mono text-xs">
                                            <pre>{children}</pre>
                                        </div>
                                    </div>
                                ) : (
                                    <code className={`${isAi ? 'bg-black/5 dark:bg-white/10 text-pink-600 dark:text-pink-400' : 'bg-white/20 text-white'} px-1.5 py-0.5 rounded font-mono text-xs`} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>,
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{children}</a>,
                        }}
                    >
                        {content}
                    </ReactMarkdown>

                    {isAi && (
                        <button
                            onClick={handleCopy}
                            className="absolute -bottom-5 right-0 p-1 text-gray-400 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                            title="Copy response"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    )}
                </div>
                {timestamp && (
                    <span className="text-[10px] opacity-40 mt-1 px-1">{timestamp}</span>
                )}
            </div>
        </motion.div>
    );
}

export function TypingIndicator() {
    return (
        <div className="flex gap-3 mb-6">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
                <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-black/40 border border-gray-100 dark:border-white/10 flex items-center gap-1">
                <motion.div
                    className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                    className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                    className="w-1.5 h-1.5 bg-pink-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
            </div>
        </div>
    );
}
