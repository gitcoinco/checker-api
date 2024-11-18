import { env } from './env';
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from '@/swagger';
import { AppDataSource } from '@/data-source';
import routes from '@/routes';
import { createLogger } from '@/logger';
import { postgraphileMiddleware } from '@/postgraphile.config';
import { BaseError } from '@/errors';

// Configure process-level error handlers before app initialization
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Promise Rejection:', { error: reason });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', { error });
  // Give the process time to log the error before exiting
  setTimeout(() => process.exit(1), 1000);
});

// Initialize Express app
const app = express();
const logger = createLogger();

app.get('/', (req, res) => {
  res.json({
    message: "Welcome to Checker! 🧐",
    apis: "/api-docs",
    graphiql: "/graphiql",
    status: "Ready to review those Gitcoin applications!",
    data: {
      current_task: "Evaluating Gitcoin applications 🚀",
      next_step: "Dive into the latest submissions 📝",
      reviewers: ["Application Guru", "Funding Finder", "Grant Guardian"]
    },
    tips: [
      "Read between the lines of every application! 👀",
      "Look for clear goals and impact in their proposals! 🎯",
      "Make sure the team is passionate and capable! 💪"
    ],
    joke: "Why did the Gitcoin applicant bring a spreadsheet to the interview? Because they wanted to 'excel' at grant proposals! 📊"
  });
});

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

// Configure global error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof BaseError) {
    res.status(err.statusCode).json({
      name: err.name,
      message: err.message,
      status: err.statusCode,
    });
  } else {
    logger.error('Unhandled error:', {
      error: err,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
    res.status(500).json({
      name: 'InternalServerError',
      message: 'An unexpected error occurred',
      status: 500,
    });
  }
});

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

const port = Number(env.PORT ?? 3000);

// Start the server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(
    `API documentation available at http://localhost:${port}/api-docs`
  );
});
