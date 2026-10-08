import express from "express";
import authRouter from "./auth.router";

const router = express.Router();

authRouter(router);

export default router;