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

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      // Create or validate conversation
      let conversationId = sessionId;

      if (!conversationId) {
        conversationId = await this.chatService.createConversation();
      } else {
        const exists =
          await this.chatService.conversationExists(conversationId);
        if (!exists) {
          res.status(404).json({ error: 'Session not found' });
          return;
        }
      }

      // Save user message
      await this.chatService.saveMessage(conversationId, 'user', message);

      // Get conversation history
      const history =
        await this.chatService.getConversationHistory(conversationId);

      // Generate AI response
      const aiReply = await this.llmService.generateReply(history, message);

      // Save AI response
      await this.chatService.saveMessage(conversationId, 'ai', aiReply);

      res.json({
        reply: aiReply,
        sessionId: conversationId,
      });
    } catch (error: any) {
      console.error('Chat controller error:', error);
      res.status(500).json({
        error: error.message || 'Failed to process message',
      });
    }
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({ error: 'Session ID is required' });
        return;
      }

      const history = await this.chatService.getConversationHistory(sessionId);
      res.json(history);
    } catch (error: any) {
      console.error('Get history error:', error);
      res.status(500).json({
        error: 'Failed to retrieve conversation history',
      });
    }
  }
}
