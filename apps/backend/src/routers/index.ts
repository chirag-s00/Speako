import express from "express";
import authRouter from "./auth.router";
import uploadRouter from "./upload.router";
import drillRouter from "./drill.router";

const router = express.Router();

authRouter(router);
uploadRouter(router);
drillRouter(router)

export default router;