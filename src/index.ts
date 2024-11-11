import express from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from '@/swagger';
import { AppDataSource } from '@/data-source';
import routes from '@/routes';
import dotenv from 'dotenv';
import { createLogger } from '@/logger';
import { postgraphileMiddleware } from '@/postgraphile.config';

dotenv.config();

const app = express();
const logger = createLogger();

// Swagger setup
const specs = swaggerJsDoc(swaggerOptions);
app.use(
  '/api-docs',
  swaggerUi.serve as express.RequestHandler,
  swaggerUi.setup(specs) as express.RequestHandler
);

app.use(postgraphileMiddleware);
app.use(express.json());
app.use('/api', routes);

AppDataSource.initialize()
  .then(() => {
    logger.info('Connected to database!');
  })
  .catch(error => {
    logger.error('Error connecting to database:', { error });
  });

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(
    `API documentation available at http://localhost:${port}/api-docs`
  );
});
