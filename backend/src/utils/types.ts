// utils/types.ts

// Keep the string literal type for internal use
export type SenderString = 'user' | 'ai';

// Enum type from Prisma
export type SenderEnum = 'USER' | 'AI';

export interface Message {
  id: string;
  conversationId: string;
  sender: SenderString; // This is what we want internally
  text: string;
  createdAt: Date;
}

export interface PrismaMessage {
  id: string;
  conversationId: string;
  sender: SenderEnum; // This is what Prisma returns
  text: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  createdAt: Date;
  messages: Message[];
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

// Helper function to convert Prisma sender to our internal sender
export function convertSender(sender: SenderEnum | string): SenderString {
  if (typeof sender === 'string') {
    return sender.toLowerCase() === 'user' ? 'user' : 'ai';
  }
  return sender === 'USER' ? 'user' : 'ai';
}
