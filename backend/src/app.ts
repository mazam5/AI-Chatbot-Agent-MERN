import express, { Application } from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';

import { errorHandler } from './middleware/errorHandler';
import chatRouter from './routes/chatRoutes';
import healthRouter from './routes/health';
import { swaggerSpec } from './swagger';

const app: Application = express();

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(cors());

app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].slice(0, 10_000);
      }
    }
  }
  next();
});

app.use('/health', healthRouter);
app.use('/api/chat', chatRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

export default app;
