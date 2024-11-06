import express from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from '@/swagger';
import { AppDataSource } from '@/data-source';
import routes from '@/routes';

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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
  console.log('API documentation available at http://localhost:3000/api-docs');
});
