import swaggerJSDoc from 'swagger-jsdoc';

const isProd = process.env.NODE_ENV === 'production';
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Express API',
      version: '1.0.0',
      description: 'Swagger documentation for Express + TypeScript',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: [isProd ? 'dist/routes/*.js' : 'src/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
