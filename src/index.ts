import express from "express";
import bodyParser from "body-parser";
import cookies from "cookie-parser";
import routes from "./routes";
import { rateLimiter } from "./middlewares/rate-limiter";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { errorHandler } from "./middlewares/error-handler";
import { APP_PORT, CORS_ORIGIN } from "./config";

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(cookies());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        credentials: true,
        origin: CORS_ORIGIN,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    }),
);

app.use(rateLimiter);
app.use('/api', routes);

app.use(errorHandler);

app.listen(APP_PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${APP_PORT}`);
});
