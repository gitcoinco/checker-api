

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```
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

5. **Handling Migration**

- Make changes to the entity
- Generate migration with `npm run generate --name=MigrationName`
- Run migration with `npm run migrate`
- If you need to revert last migration, `npm run revert`

6. **Run the Development Server**:

   ```bash
   npm run dev
   ```

7. **Access the API**:
  The API endpoints can be accessed at `http://localhost:3000/api/pool`.
  Load up some dummy data using

     ```shell
     INSERT INTO "pool"("chainId","roundId","strategy") VALUES('10','12','DirectGrants');
     ```