Sure! Here’s the README content formatted in Markdown (.md) format. You can copy and paste it directly into your README.md file.

# Next.js + TypeORM + PostgreSQL API

This repository contains a Next.js application configured to use TypeORM for database interactions with a PostgreSQL backend. The application is structured to provide a clean separation of concerns, making it easier to manage and maintain.

## Project Structure
```

/src
│
├── /app # Next.js application routes
│ ├── /api # API endpoints
│ │ ├── /pool # Pool API endpoints
│ │ │ ├── index.ts # Handles POST and GET requests for pools
│ │ │ └── [id].ts # Handles GET, PUT, DELETE requests for a specific pool
│ │
│ └── /page.tsx # Main entry point for your application
│
├── /data-source.ts # TypeORM DataSource configuration
│
├── /entities # TypeORM entities
│ └── Pool.ts # Pool entity definition
│
├── /repositories # Data access layer
│ └── PoolRepository.ts # Repository for interacting with Pool entity
│
├── /services # Business logic layer
│ └── PoolService.ts # Service for managing pool operations
│
├── /styles # CSS styles (if applicable)
│ └── page.module.css # Styles for the main page

````

## Overview of Key Components

- **Entities**:
  - Located in the `/entities` directory, entities represent the data models in the database. For example, `Pool.ts` defines the structure of the `Pool` entity.

- **Repositories**:
  - Found in the `/repositories` directory, repositories handle data access and provide methods for CRUD operations. The `PoolRepository.ts` manages database interactions for the `Pool` entity.

- **Services**:
  - The `/services` directory contains the business logic for the application. The `PoolService.ts` provides methods that utilize the repository for operations like creating, updating, and fetching pools.

- **API Routes**:
  - The API routes are located in the `/app/api` directory. Each file corresponds to an entity and handles HTTP requests:
    - `index.ts` manages the collection of pools (POST to create and GET to retrieve).
    - `[id].ts` manages operations on a specific pool (GET, PUT, DELETE).

- **Data Source**:
  - The `/data-source.ts` file contains the configuration for TypeORM, including database connection settings and options like `synchronize` and `logging`.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
````
2. Install Hooks
```bash
   npm run prepare
```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of the project and set the necessary environment variables for database connection.

4. **Setting up your databas**:

- Connect as admin `psql -U your_admin_username -h your_database_host -p your_database_port`
- In `psql` shell, run
  ```shell
  CREATE DATABASE your_database_name;
  CREATE ROLE your_database_username WITH LOGIN PASSWORD 'your_database_password';
  GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_database_username;
  ```

4. **Run the Development Server**:

   ```bash
   npm run dev
   ```

5. **Access the API**:
   The API endpoints can be accessed at `http://localhost:3000/api/pool`.
