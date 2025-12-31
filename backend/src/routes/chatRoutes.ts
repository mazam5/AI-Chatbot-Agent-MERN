import { Request, Response, Router } from 'express';
import { ChatController } from '../controllers/chatController';

const router = Router();
const chatController = new ChatController();
/**
 * @swagger
 * /chat/message:
 *   post:
 *     summary: Send a message
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                 sessionId:
 *                   type: string
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
