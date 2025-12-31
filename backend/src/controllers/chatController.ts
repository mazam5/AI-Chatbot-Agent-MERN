import { Request, Response } from 'express';
import { ChatService } from '../services/chatService.js';
import { LLMService } from '../services/llmService.js';

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

      await this.chatService.saveMessage(conversationId, 'user', message);

      const history =
        await this.chatService.getConversationHistory(conversationId);

      const aiReply = await this.llmService.generateReply(history, message);

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

  async getSessions(req: Request, res: Response): Promise<void> {
    try {
      const sessions = await this.chatService.getAllSessions();
      res.json(sessions);
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ error: 'Failed to load sessions' });
    }
  }

  async deleteSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      await this.chatService.deleteSession(sessionId);
      res.json({ message: 'Session deleted successfully' });
    } catch (error) {
      console.error('Delete session error:', error);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  }
}
