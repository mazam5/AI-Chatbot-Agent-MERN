import express, { Application } from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { errorHandler } from './middleware/errorHandler';
import chatRouter from './routes/chat';
import healthRouter from './routes/health';
import { swaggerSpec } from './swagger';

const app: Application = express();

app.use(express.json());
app.use(morgan('dev'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/health', healthRouter);
app.use('/chat', chatRouter);

app.use(errorHandler);

export default app;
