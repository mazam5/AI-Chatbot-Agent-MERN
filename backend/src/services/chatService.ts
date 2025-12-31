import { pool } from '../config/database.js';
import {
  Message,
  ConversationSummary,
  SenderString,
  convertSender,
} from '../utils/types.js';

export class ChatService {
  async getAllSessions(): Promise<ConversationSummary[]> {
    const { rows } = await pool.query(
      `
      SELECT
        c.id,
        c.created_at,
        m.id AS message_id,
        m.sender,
        m.text,
        m.created_at AS message_created_at
      FROM conversations c
      LEFT JOIN messages m ON m.conversation_id = c.id
      ORDER BY c.created_at DESC, m.created_at ASC
      `
    );

    const map = new Map<string, any>();

    for (const row of rows) {
      if (!map.has(row.id)) {
        map.set(row.id, {
          id: row.id,
          createdAt: row.created_at,
          messages: [],
        });
      }

      if (row.message_id) {
        map.get(row.id).messages.push({
          sender: row.sender,
          text: row.text,
          createdAt: row.message_created_at,
        });
      }
    }

    return Array.from(map.values()).map((conversation) => {
      const firstUserMessage = conversation.messages.find(
        (m: any) => convertSender(m.sender) === 'user'
      );

      const lastMessage =
        conversation.messages[conversation.messages.length - 1];

      return {
        id: conversation.id,
        title: firstUserMessage?.text.slice(0, 40) + '...' || 'New Chat',
        lastMessage:
          lastMessage?.text.slice(0, 60) + '...' || 'No messages yet',
        timestamp: lastMessage?.createdAt || conversation.createdAt,
        messageCount: conversation.messages.length,
      };
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await pool.query(`DELETE FROM conversations WHERE id = $1`, [sessionId]);
  }

  async createConversation(): Promise<string> {
    const { rows } = await pool.query(
      `INSERT INTO conversations DEFAULT VALUES RETURNING id`
    );

    return rows[0].id;
  }

  async conversationExists(conversationId: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      `SELECT 1 FROM conversations WHERE id = $1`,
      [conversationId]
    );

    return rowCount === 1;
  }

  async saveMessage(
    conversationId: string,
    sender: SenderString,
    text: string
  ): Promise<void> {
    await pool.query(
      `
      INSERT INTO messages (conversation_id, sender, text)
      VALUES ($1, $2, $3)
      `,
      [conversationId, sender, text.slice(0, 10000)]
    );
  }

  async getConversationHistory(conversationId: string): Promise<Message[]> {
    const { rows } = await pool.query(
      `
      SELECT id, conversation_id, sender, text, created_at
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      `,
      [conversationId]
    );

    return rows.map((msg) => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      sender: convertSender(msg.sender),
      text: msg.text,
      createdAt: msg.created_at,
    }));
  }

  async getRecentConversationHistory(
    conversationId: string,
    limit: number = 10
  ): Promise<Message[]> {
    const { rows } = await pool.query(
      `
      SELECT id, conversation_id, sender, text, created_at
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at DESC
      LIMIT $2
      `,
      [conversationId, limit * 2]
    );

    return rows.reverse().map((msg) => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      sender: convertSender(msg.sender),
      text: msg.text,
      createdAt: msg.created_at,
    }));
  }
}
