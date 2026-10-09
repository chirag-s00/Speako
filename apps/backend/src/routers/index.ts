import express from "express";
import authRouter from "./auth.router";
import uploadRouter from "./upload.router";

const router = express.Router();

authRouter(router);
uploadRouter(router);

export default router;