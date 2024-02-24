import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { db } from "./db";
import { destination } from "./db/schema";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", async (req: Request, res: Response) => {
  const result = await db.select().from(destination);
  res.send(result);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
