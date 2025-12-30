// src/services/chatService.ts
import { prisma } from '../lib/prisma';

type Sender = 'user' | 'ai';

export interface Message {
  id: string;
  conversationId: string;
  sender: string;
  text: string;
  createdAt: Date;
}

export class ChatService {
  async createConversation(): Promise<string> {
    const conversation = await prisma.conversation.create({
      data: {},
    });

    return conversation.id;
  }

  async conversationExists(conversationId: string): Promise<boolean> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    return conversation !== null;
  }

  async saveMessage(
    conversationId: string,
    sender: 'user' | 'ai',
    text: string
  ): Promise<void> {
    await prisma.message.create({
      data: {
        conversationId,
        sender: sender as Sender,
        text,
      },
    });
  }

  async getConversationHistory(conversationId: string): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        conversationId: true,
        sender: true,
        text: true,
        createdAt: true,
      },
    });

    return messages.map((msg) => ({
      ...msg,
      sender: msg.sender.toLowerCase(),
    }));
  }

  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}
