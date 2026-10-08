import express from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

export const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.cookies?.token;
    try{
        if(!token){
            return res.status(401).json({error: "Unauthorized"});
        }
        const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
        if (typeof payload === "string" || typeof payload.sub !== "string") {
            return res.status(401).json({ error: "Unauthorized" });
        }

        req.userId = payload.sub;
        next();

    }catch(error){
        return res.status(401).json({error: "Unauthorized"});
    }
}