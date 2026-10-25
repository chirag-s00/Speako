import express from "express";
import cors from "cors";
import router from "./routers";
import cookieParser from "cookie-parser";
import { env } from "./lib/env";

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/",router);
export {app};