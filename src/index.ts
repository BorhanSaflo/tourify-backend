import express, { Express } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import { rateLimiter } from "./middlewares/rate-limiter";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./utils/errors";

dotenv.config();
const port = process.env.PORT || 3000;
const app: Express = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN || "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);
app.use(rateLimiter);

app.use("/api", routes);
app.get("/", async (req, res) => res.send("Hello World!"));

app.use((req, res, next) => next(new NotFoundError("Not Found")));
app.use(errorHandler);

app.listen(port as number, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${port}`);
});
