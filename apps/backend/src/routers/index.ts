import express from "express";
import authRouter from "./auth.router";
import uploadRouter from "./upload.router";
import drillRouter from "./drill.router";
import resultRouter from "./result.router";

const router = express.Router();

authRouter(router);
uploadRouter(router);
drillRouter(router)
resultRouter(router);

export default router;