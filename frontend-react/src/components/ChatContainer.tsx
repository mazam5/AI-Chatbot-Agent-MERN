import { chatAPI } from '@/services/chatApi';
import type { ApiMessage, ChatMessage } from '@/types';
import { AlertCircle, Bot, Check, Copy, Loader2, RotateCcw, Send, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ToggleTheme } from './theme/ToggleTheme';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface ChatContainerProps {
    currentSessionId: string | null;
    onSessionUpdate: (sessionId: string) => void;
    onNewChat: () => void;
}

const ChatContainer = ({ currentSessionId, onSessionUpdate, onNewChat }: ChatContainerProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 1,
            role: 'ai',
            content: "Hello! I'm your customer support agent. How can I help you today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // Load messages from API when session changes
    useEffect(() => {
        const loadMessages = async () => {
            if (currentSessionId) {
                setIsLoadingHistory(true);
                try {
                    const history = await chatAPI.getChatHistory(currentSessionId);

                    if (history && history.length > 0) {
                        // Convert API response to ChatMessage format
                        const formattedMessages: ChatMessage[] = history.map((msg: ApiMessage) => ({
                            id: msg.id,
                            role: msg.sender === 'user' ? 'user' : 'ai',
                            content: msg.text,
                            timestamp: new Date(msg.createdAt)
                        }));
                        setMessages(formattedMessages);
                    } else {
                        // If no history, show initial greeting
                        setMessages([
                            {
                                id: 1,
                                role: 'ai',
                                content: "Hello! I'm your customer support agent. How can I help you today?",
                                timestamp: new Date()
                            }
                        ]);
                    }
                } catch (err) {
                    console.error('Failed to load chat history:', err);
                    setError('Failed to load chat history');
                    // Show initial greeting on error
                    setMessages([
                        {
                            id: 1,
                            role: 'ai',
                            content: "Hello! I'm your customer support agent. How can I help you today?",
                            timestamp: new Date()
                        }
                    ]);
                } finally {
                    setIsLoadingHistory(false);
                }
            } else {
                // Reset to initial message for new chat
                setMessages([
                    {
                        id: 1,
                        role: 'ai',
                        content: "Hello! I'm your customer support agent. How can I help you today?",
                        timestamp: new Date()
                    }
                ]);
            }
        };

        loadMessages();
    }, [currentSessionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMessage: ChatMessage = {
            id: Date.now(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        // Optimistically add user message
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);
        setError(null);

        try {
            // Send message to API - let the backend create or use existing session
            const response = await chatAPI.sendMessage(input, currentSessionId || undefined);

            // Update session ID from API response
            if (!currentSessionId && response.sessionId) {
                onSessionUpdate(response.sessionId);
            }

            const aiMessage: ChatMessage = {
                id: Date.now() + 1,
                role: 'ai',
                content: response.reply,
                timestamp: new Date()
            };

            setMessages(prev => {
                // Remove the optimistic message and add the confirmed one with AI response
                const filtered = prev.filter(msg => msg.id !== userMessage.id);
                return [...filtered, { ...userMessage, id: Date.now() - 1 }, aiMessage];
            });
        } catch (err) {
            console.error('Error sending message:', err);
            const errorMsg = err instanceof Error ? err.message : 'Failed to get response';
            setError(errorMsg);

            // Remove the optimistic user message on error
            setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));

            // Add error message
            const errorMessage: ChatMessage = {
                id: Date.now() + 1,
                role: 'ai',
                content: "I apologize, but I'm having trouble connecting to the server. Please check if the backend is running and try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
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

    return (
        <div className="w-full h-full flex flex-col bg-background">
            {/* Header */}
            <header className="bg-card border-b shadow-sm shrink-0">
                <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="hidden sm:block flex-1">
                            <h1 className="text-lg sm:text-xl font-semibold">
                                Azamon Support Agent
                            </h1>
                            <p className="text-xs text-muted-foreground hidden sm:block">
                                {currentSessionId ? `Session: ${currentSessionId}` : 'New conversation'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ToggleTheme />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={onNewChat}
                                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                                </Button>
                            </TooltipTrigger>

                            <TooltipContent side="bottom" className="flex items-center gap-2">
                                <span>Reset conversation</span>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </header>

            {/* Error Banner */}
            {error && (
                <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-3 sm:px-4 md:px-6 py-4 max-w-4xl mx-auto">
                    {isLoadingHistory ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="text-muted-foreground">Loading conversation...</div>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`mb-4 sm:mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}
                            >
                                <div className={`flex gap-2 sm:gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {/* Avatar */}
                                    <div className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${message.role === 'ai'
                                        ? 'bg-linear-to-br from-blue-500 to-purple-600'
                                        : 'bg-secondary'
                                        }`}>
                                        {message.role === 'ai' ? (
                                            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                        ) : (
                                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-foreground" />
                                        )}
                                    </div>

                                    {/* Message Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base ${message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-card border'
                                            }`}>
                                            <div className="whitespace-pre-wrap wrap-break-word">{message.content}</div>
                                        </div>

                                        {/* Action Buttons */}
                                        {message.role === 'ai' && (
                                            <div className="flex gap-2 mt-2 ml-1">
                                                <button
                                                    onClick={() => copyToClipboard(message.content, message.id)}
                                                    className="p-1.5 hover:bg-accent rounded transition-colors"
                                                    title="Copy message"
                                                >
                                                    {copiedId === message.id ? (
                                                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-500" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="bg-card border rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
                                <div className="flex gap-1 items-baseline">
                                    <div>Agent is typing</div>
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t bg-card shrink-0">
                <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 max-w-4xl mx-auto">
                    <div className="relative">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about shipping, returns, products..."
                            className="w-full resize-none rounded-xl border bg-background px-3 py-2 sm:px-4 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                            style={{ maxHeight: '200px' }}
                            rows={1}
                        />
                        {isTyping ? (
                            <Button disabled className="absolute right-1.5 bottom-1.5 sm:right-2 sm:bottom-2 p-1.5 sm:p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={!input.trim() || isTyping}
                                className="absolute right-1.5 bottom-1.5 sm:right-2 sm:bottom-2 p-1.5 sm:p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                        )
                        }
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2 hidden sm:block">
                        Press Enter to send, Shift + Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatContainer;