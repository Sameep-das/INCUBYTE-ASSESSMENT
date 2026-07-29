import express from "express";
import cors from "cors";
import env from "./config/env.config.js";
import cookieParser from "cookie-parser";

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

export default app;