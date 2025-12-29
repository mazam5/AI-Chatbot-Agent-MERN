import { Request, Response, Router } from 'express';

const router = Router();
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
router.post('/message', (req: Request, res: Response) => {
  res.json({
    reply: req.body.message || 'Hello',
    sessionId: req.body.sessionId || 'Id1234',
  });
});

export default router;
