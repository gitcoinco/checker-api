import { type SwaggerOptions } from 'swagger-jsdoc';

const options: SwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'checker-api',
      version: '1.0.0',
      description: 'API documentation for checker',
    },
    servers: [
      {
        url: '/api',
        description: 'Base URL for all API routes',
      },
    ],
  },
  apis: ['src/routes/*.ts'],
};

export default options;
