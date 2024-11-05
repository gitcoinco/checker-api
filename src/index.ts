import express from "express";
import { AppDataSource } from "./data-source";
import { EntityManager } from "typeorm";
import { Pool } from "./entity/Pool";

const app = express();

AppDataSource.initialize()
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.log("Error connecting to database:", error);
  });

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

app.post("/pool", async (req, res) => {
  const entityManager: EntityManager = AppDataSource.manager;
  const pool = new Pool();
  pool.chainId = "111551111";
  pool.roundId = Math.floor(Math.random() * 100).toString();
  pool.strategy = "Strategy";
  await entityManager.save(pool);
  res.send("Pool saved");
});
