import express from "express";
import { login, register } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import {loginSchema, registerSchema} from "@speako/common/common"
import { registerLimiter, loginLimiter } from "../middleware/rateLimiter";


export default(router: express.Router) => {
router.post("/login",loginLimiter, validate(loginSchema), login);
router.post("/register",registerLimiter, validate(registerSchema), register);
}
