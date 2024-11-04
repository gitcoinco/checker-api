var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { AppDataSource } from "./data-source";
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
app.post("/pool", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const entityManager = AppDataSource.manager;
    const pool = new Pool();
    pool.chainId = "11155111";
    pool.roundId = Math.floor(Math.random() * 100).toString();
    pool.strategy = "Strategy";
    yield entityManager.save(pool);
    res.send("Pool saved");
}));
