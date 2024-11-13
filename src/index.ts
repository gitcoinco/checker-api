// Load environment variables from .env file before other imports
import dotenv from 'dotenv';

import express from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from '@/swagger';
import { AppDataSource } from '@/data-source';
import routes from '@/routes';
import { createLogger } from '@/logger';
import { postgraphileMiddleware } from '@/postgraphile.config';
dotenv.config();

// Initialize Express app
const app = express();
const logger = createLogger();

// Swagger setup
const specs = swaggerJsDoc(swaggerOptions);
app.use(
  '/api-docs',
  swaggerUi.serve as express.RequestHandler,
  swaggerUi.setup(specs) as express.RequestHandler
);

// Configure GraphQL server
app.use(postgraphileMiddleware);

// Configure JSON body parser
app.use(express.json());

// Configure routes
app.use('/api', routes);

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    logger.info('Connected to database!');
  })
  .catch(error => {
    logger.error('Error connecting to database:', { error });
  });

const port = Number(process.env.PORT ?? 3000);

// Start the server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(
    `API documentation available at http://localhost:${port}/api-docs`
  );
});
