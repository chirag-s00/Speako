import express from "express";
import { login, register } from "../controllers/auth.controller";


export default(router: express.Router) => {
router.post("/login", login);
router.post("/register", register);
}
