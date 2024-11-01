import { DataSource } from "typeorm";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();
// Set default values for environment variables
const synchronize = process.env.SYNCHRONIZE === "true";
const logging = process.env.LOGGING === "true";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: synchronize, // Sync entities with the database (set to false in production)
  logging: logging,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
});

// Initialize the data source
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
