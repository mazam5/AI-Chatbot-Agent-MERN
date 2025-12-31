import { prisma } from '../config/prisma-config.js';
import {
  convertSender,
  ConversationSummary,
  Message,
  SenderString,
} from '../utils/types.js';

export class ChatService {
  async getAllSessions(): Promise<ConversationSummary[]> {
    const conversations = await prisma.conversation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return conversations.map((conversation) => {
      const firstUserMessage = conversation.messages.find(
        (m) => convertSender(m.sender) === 'user'
      );

      const lastMessage =
        conversation.messages[conversation.messages.length - 1];

      return {
        id: conversation.id,
        title: firstUserMessage
          ? firstUserMessage.text.slice(0, 40) + '...'
          : 'New Chat',
        lastMessage: lastMessage
          ? lastMessage.text.slice(0, 60) + '...'
          : 'No messages yet',
        timestamp: lastMessage?.createdAt || conversation.createdAt,
        messageCount: conversation.messages.length,
      };
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await prisma.conversation.delete({
      where: { id: sessionId },
    });
  }

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
    sender: SenderString,
    text: string
  ): Promise<void> {
    await prisma.message.create({
      data: {
        conversationId,
        sender: convertSender(sender),
        text: text.slice(0, 10000),
      },
    });
  }

  async getConversationHistory(conversationId: string): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      sender: convertSender(msg.sender),
      text: msg.text,
      createdAt: msg.createdAt,
    }));
  }

  async getRecentConversationHistory(
    conversationId: string,
    limit: number = 10
  ): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit * 2,
    });

    return messages.reverse().map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      sender: convertSender(msg.sender),
      text: msg.text,
      createdAt: msg.createdAt,
    }));
  }

  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}
