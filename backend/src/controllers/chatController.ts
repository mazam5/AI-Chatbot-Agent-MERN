// src/controllers/chatController.ts
import { Request, Response } from 'express';
import { ChatService } from '../services/chatService';
import { LLMService } from '../services/llmService';

export class ChatController {
  private chatService: ChatService;
  private llmService: LLMService;

  constructor() {
    this.chatService = new ChatService();
    this.llmService = new LLMService();
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { message, sessionId } = req.body;

      // Validate input
      if (!message || typeof message !== 'string') {
        res
          .status(400)
          .json({ error: 'Message is required and must be a string' });
        return;
      }

      const trimmedMessage = message.trim();
      if (trimmedMessage.length === 0) {
        res.status(400).json({ error: 'Message cannot be empty' });
        return;
      }

      if (trimmedMessage.length > 2000) {
        res
          .status(400)
          .json({ error: 'Message is too long (max 2000 characters)' });
        return;
      }

      // Get or create conversation
      let conversationId = sessionId;
      if (!conversationId) {
        conversationId = await this.chatService.createConversation();
      } else {
        // Verify conversation exists
        const exists =
          await this.chatService.conversationExists(conversationId);
        if (!exists) {
          conversationId = await this.chatService.createConversation();
        }
      }

      // Save user message
      await this.chatService.saveMessage(
        conversationId,
        'user',
        trimmedMessage
      );

      // Get conversation history
      const history =
        await this.chatService.getConversationHistory(conversationId);

      // Generate AI reply
      const aiReply = await this.llmService.generateReply(
        history,
        trimmedMessage
      );

      // Save AI message
      await this.chatService.saveMessage(conversationId, 'ai', aiReply);

      res.json({
        reply: aiReply,
        sessionId: conversationId,
      });
    } catch (error: any) {
      console.error('Error in sendMessage:', error);

      // Handle specific error types
      if (error.message?.includes('API key')) {
        res.status(500).json({
          error: 'Configuration error. Please contact support.',
        });
      } else if (error.message?.includes('rate limit')) {
        res.status(429).json({
          error: 'Too many requests. Please try again in a moment.',
        });
      } else if (error.message?.includes('timeout')) {
        res.status(504).json({
          error: 'Request timeout. Please try again.',
        });
      } else {
        res.status(500).json({
          error: 'Failed to process message. Please try again.',
        });
      }
    }
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({ error: 'Session ID is required' });
        return;
      }

      const exists = await this.chatService.conversationExists(sessionId);
      if (!exists) {
        res.json({ messages: [] });
        return;
      }

      const messages = await this.chatService.getConversationHistory(sessionId);
      res.json({ messages });
    } catch (error) {
      console.error('Error in getHistory:', error);
      res
        .status(500)
        .json({ error: 'Failed to retrieve conversation history' });
    }
  }
}
