import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Spur AI Chat API',
      version: '1.0.0',
      description: 'API for AI-powered customer support chat',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        ChatRequest: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string',
              description: 'User message',
            },
            sessionId: {
              type: 'string',
              description: 'Existing conversation ID (optional)',
            },
          },
        },
        ChatResponse: {
          type: 'object',
          properties: {
            reply: {
              type: 'string',
              description: 'AI response',
            },
            sessionId: {
              type: 'string',
              description: 'Conversation ID',
            },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            conversationId: { type: 'string' },
            sender: { type: 'string', enum: ['user', 'ai'] },
            text: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
