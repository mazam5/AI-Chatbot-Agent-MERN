import { Bot, Check, Copy, RotateCcw, Send, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ToggleTheme } from './theme/ToggleTheme';

const ChatContainer = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: "Hello! I'm your AI assistant. How can I help you today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    }, [input]);

    const simulateAIResponse = async (userMessage: string) => {
        setIsTyping(true);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const responses = [
            `I understand you're asking about "${userMessage.substring(0, 50)}...". Let me help you with that.\n\nHere's what I can tell you:\n\n1. This is a simulated AI response\n2. In a real application, this would connect to an AI API\n3. The response would be generated based on your specific question\n\nIs there anything specific you'd like to know more about?`,
            `Great question! Based on your query about "${userMessage.substring(0, 30)}...", here are some key points:\n\n• AI chat interfaces typically use websockets or streaming APIs\n• Message history is stored in state\n• The UI updates in real-time as responses come in\n\nWould you like me to elaborate on any of these points?`,
            `I can help with that. Here's a detailed explanation:\n\nWhen building AI chat applications, consider:\n\n**Architecture**\n- Frontend: React with state management\n- Backend: API integration with AI services\n- Real-time updates: WebSockets or Server-Sent Events\n\n**Best Practices**\n- Handle streaming responses\n- Implement error handling\n- Add loading states\n- Store conversation history\n\nLet me know if you need more specific guidance!`
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];

        const newMessage = {
            id: Date.now(),
            role: 'assistant',
            content: response,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setIsTyping(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        await simulateAIResponse(input);
    };


    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const resetChat = () => {
        setMessages([
            {
                id: 1,
                role: 'assistant',
                content: "Hello! I'm your AI assistant. How can I help you today?",
                timestamp: new Date()
            }
        ]);
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex flex-col h-full w-full bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                {/* Header */}
                <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">AI Support Agent</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Always here to help</p>
                            </div>
                        </div>
                        <div className="flex">

                            <button
                                onClick={resetChat}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="New chat"
                            >
                                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                            <ToggleTheme />
                        </div>
                    </div>
                </header>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="px-3 sm:px-4 md:px-6 py-4 w-full max-w-none">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`mb-4 sm:mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}
                            >
                                <div className={`flex gap-2 sm:gap-3 w-full sm:max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {/* Avatar */}
                                    <div className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${message.role === 'assistant'
                                        ? 'bg-linear-to-br from-blue-500 to-purple-600'
                                        : 'bg-slate-700 dark:bg-slate-600'
                                        }`}>
                                        {message.role === 'assistant' ? (
                                            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        ) : (
                                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        )}
                                    </div>

                                    {/* Message Content */}
                                    <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base ${message.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                                            }`}>
                                            <div className="whitespace-pre-wrap wrap-break-word">{message.content}</div>
                                        </div>

                                        {/* Action Buttons */}
                                        {message.role === 'assistant' && (
                                            <div className="flex gap-2 mt-2 ml-1">
                                                <button
                                                    onClick={() => copyToClipboard(message.content, message.id)}
                                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                                    title="Copy message"
                                                >
                                                    {copiedId === message.id ? (
                                                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-500" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500" />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
                                <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
                    <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 w-full mx-auto">
                        <div className="relative">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Message AI Assistant..."
                                className="w-full resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 sm:px-4 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                style={{ maxHeight: '200px' }}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={!input.trim() || isTyping}
                                className="absolute right-1.5 top   -1.5 sm:right-2 sm:bottom-2 p-1.5 sm:p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2 hidden sm:block">
                            Press Enter to send, Shift + Enter for new line
                        </p>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ChatContainer;