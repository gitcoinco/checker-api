import express from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from '@/swagger';
import { AppDataSource } from '@/data-source';
import routes from '@/routes';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Swagger setup
const specs = swaggerJsDoc(swaggerOptions);
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(express.json());
app.use('/api', routes);

AppDataSource.initialize()
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(error => {
    console.log('Error connecting to database:', error);
  });

const port = Number(process.env.PORT) ?? 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(
    `API documentation available at http://localhost:${port}/api-docs`
  );
});
