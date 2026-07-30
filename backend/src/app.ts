import express from "express";
import cors from "cors";
import env from "./config/env.config.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        "http://localhost:5173",
        env.FRONTEND_URL,
    ],
    credentials: true,
}));

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use(errorHandler);
export default app;