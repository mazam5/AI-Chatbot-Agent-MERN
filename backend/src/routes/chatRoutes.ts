import { Request, Response, Router } from 'express';
import { ChatController } from '../controllers/chatController.js';

const router = Router();
const chatController = new ChatController(); /**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat session and messaging APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatMessage:
 *       type: object
 *       properties:
 *         role:
 *           type: string
 *           enum: [user, ai]
 *           example: user
 *         content:
 *           type: string
 *           example: Hello!
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     ChatSession:
 *       type: object
 *       properties:
 *         sessionId:
 *           type: string
 *           example: "a3f1c9b2-1234-4cde-9abc-1234567890ab"
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     SendMessageRequest:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           example: "Hello, how are you?"
 *         sessionId:
 *           type: string
 *           nullable: true
 *           example: "a3f1c9b2-1234-4cde-9abc-1234567890ab"
 *
 *     SendMessageResponse:
 *       type: object
 *       properties:
 *         reply:
 *           type: string
 *           example: "I'm doing great! How can I help you?"
 *         sessionId:
 *           type: string
 *           example: "a3f1c9b2-1234-4cde-9abc-1234567890ab"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Session not found"
 */

/**
 * @swagger
 * /chat/message:
 *   post:
 *     summary: Send a message to the AI
 *     description: Sends a message to the chat engine. Creates a new session if sessionId is not provided.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       200:
 *         description: AI response with session ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SendMessageResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /chat/history/{sessionId}:
 *   get:
 *     summary: Get conversation history
 *     description: Returns the full message history for a given chat session.
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat session ID
 *     responses:
 *       200:
 *         description: Conversation history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatMessage'
 *       400:
 *         description: Missing session ID
 *       500:
 *         description: Failed to retrieve conversation history
 */

/**
 * @swagger
 * /chat/sessions:
 *   get:
 *     summary: Get all chat sessions
 *     description: Returns a list of all chat sessions.
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: List of sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatSession'
 *       500:
 *         description: Failed to load sessions
 */

/**
 * @swagger
 * /chat/session/{sessionId}:
 *   delete:
 *     summary: Delete a chat session
 *     description: Deletes a chat session and all its messages.
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat session ID
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Session deleted successfully
 *       500:
 *         description: Failed to delete session
 */

router.post('/message', (req: Request, res: Response) =>
  chatController.sendMessage(req, res)
);

router.get('/history/:sessionId', (req: Request, res: Response) =>
  chatController.getHistory(req, res)
);

router.get('/sessions', (req: Request, res: Response) => {
  chatController.getSessions(req, res);
});

router.delete('/session/:sessionId', (req: Request, res: Response) => {
  chatController.deleteSession(req, res);
});

export default router;
