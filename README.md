# checker-api

## Structure

```
.
├── README.md                   # Project documentation
├── package-lock.json           # Dependency lock file
├── package.json                # Project metadata and dependencies
├── src                         # Source code for the application
│   ├── controller              # Routing controller logic
│   ├── entity                  # TypeORM entities, defining database schemas and relations
│   ├── ext                     # External API integrations
│   ├── migration               # Database migrations for schema changes
│   ├── repository              # Repositories for data access logic
│   ├── routes                  # API routes
│   ├── service                 # Business logic and service functions
│   ├── data-source.ts          # Database connection setup and configuration
│   ├── index.ts                # Application entry point
│   └── swagger.ts              # Optional: Swagger setup in TypeScript
│   └── utils.ts                # Utility functions and helper methods
└── tsconfig.json               # TypeScript configuration
```

## Getting Started

1. **Basic Setup**:
   ```bash
   npm install
   npm run prepare
   ```
2. **Configure Environment Variables**:
   Create a `.env` file in the root of the project and set the necessary environment variables for database connection.
3. **Setting up your databas**:
- Connect as admin `psql -U your_admin_username -h your_database_host -p your_database_port`
- In `psql` shell, run
  ```shell
  CREATE DATABASE your_database_name;
  CREATE ROLE your_database_username WITH LOGIN PASSWORD 'your_database_password';
  GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_database_username;
  ```
4. **Handling Migration**
- Make changes to the entity
- Generate migration with `npm run generate --name=MigrationName`
- Run migration with `npm run migrate`
- If you need to revert last migration, `npm run revert`
5. **Run the Development Server**:
   ```bash
   npm run dev
   ```
6. **Testing the setup**:
  - Create a test pool with `curl -X POST http://localhost:3000/api/pools/create-test`
  - Retrieved the created pool with `curl -X GET http://localhost:3000/api/pools`

7. **API Overview**
  - Visit `http://localhost:3000/api-docs`

**Note**

- For [Logging.md](./src//logger/logger.md) to understand use winston for logging
- For Try catch handling done via [catchError](./src/utils.ts)
- All routes are documented using [swagger](./src/swagger.ts)

```
Pools
------
GET : /pools (get all pools)
  - ?manager="0x.." (filter by manager)
  - ?review-active  (is in review period)

GET : /pools/:chainId/:poolId (get pool by id)
GET : /pools/:chainId/:poolId/applications (get all application of a pool)
GET : /pools/:chainId/:poolId/application/:applicationId (get specfic applications)
GET : /pools/:chainId/:poolId/application/:applicationId/evaluations (get all evaluations)
GET : /pools/:chainId/:poolId/application/:applicationId/evaluations/:evaluator (fetch evaluation by evaluator)


POST: /pool/:chainId/:poolId/application/:applicationId/evaluate (save evaluation)
POST: /pool/:chainId/:poolId/application/:applicationId/evaluate-llm (trigger llm evaluation)
POST: /pool/:chainId/:poolId/evaluation-questions (save questions needed for evaluation)
POST: /pool/:chainId/:poolId/application/:applicationId/review (notify backend that on-chain review is done)

Profile 
-------
GET: /profile/:profileId/applications ( get all applications by profile)
```
