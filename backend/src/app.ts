import express from "express";
import healthRouter from "./routes/health";
import { errorHandler } from "./middleware/errorHandler";
import morgan from "morgan";
const app = express();

app.use(express.json());
app.use(morgan("combined"));

app.use("/health", healthRouter);

app.use(errorHandler);

export default app;
