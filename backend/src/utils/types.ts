export type SenderString = 'user' | 'ai';

export type SenderEnum = 'USER' | 'AI';

export interface Message {
  id: string;
  conversationId: string;
  sender: SenderString;
  text: string;
  createdAt: Date;
}

export interface PrismaMessage {
  id: string;
  conversationId: string;
  sender: SenderEnum;
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

export function convertSender(sender: SenderEnum | string): SenderString {
  if (typeof sender === 'string') {
    return sender.toLowerCase() === 'user' ? 'user' : 'ai';
  }
  return sender === 'USER' ? 'user' : 'ai';
}
