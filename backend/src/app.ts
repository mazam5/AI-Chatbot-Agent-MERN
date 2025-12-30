import express, { Application } from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';

import { errorHandler } from './middleware/errorHandler';
import chatRouter from './routes/chatRoutes';
import healthRouter from './routes/health';
import { swaggerSpec } from './swagger';

const app: Application = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request validation middleware
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    // Sanitize input
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].slice(0, 10000); // Prevent huge strings
      }
    });
  }
  next();
});

app.use('/health', healthRouter);
app.use('/api/chat', chatRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'An unexpected error occurred. Please try again.',
    });
  }
);
app.use(errorHandler);

export default app;
