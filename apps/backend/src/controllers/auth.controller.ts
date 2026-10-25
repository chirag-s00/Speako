import express from "express";
import {prisma} from "@speako/db/client"
import argon2 from "argon2";
import { Prisma } from "../../../../packages/db/generated/prisma/client";
import {env} from "../lib/env"
import jwt from "jsonwebtoken";

let dummyHash: string | undefined;

async function getDummyHash() {
    dummyHash ??= await argon2.hash("dummy-password", { type: argon2.argon2id });
    return dummyHash;
}

export async function register(req: express.Request, res: express.Response) {
    const { email, password, username } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } })
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }
        const passwordHash = await argon2.hash(password, { type: argon2.argon2id });


        const newUser = await prisma.user.create({
            data: { email,passwordHash: passwordHash, username }, select: { id: true, username: true },
        })

        return res.status(201).json({ message: "User registered successfully", user: { id: newUser.id, username: newUser.username } });
    } catch (error) {
         if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return res.status(409).json({ error: "User already exists" });
        }

        console.error("Registration failed:", error);
        return res.status(500).json({ error: "Registration failed" });
    }
    
}


export async function login(req: express.Request, res: express.Response) { 
    
    const { email, password } = req.body;
    
    try{
        const existingUser = await prisma.user.findUnique({
            where:{email},
            select:{id:true, passwordHash:true, username:true}
        })

        const isPasswordValid = await argon2.verify(existingUser?.passwordHash?? (await getDummyHash()), password);

        if (!existingUser || !isPasswordValid) {
            return res.status(401).json({error: "Invalid email or password"});
        }

        const JWT_SECRET = env.JWT_SECRET;

        const token = jwt.sign({ sub: existingUser.id}, JWT_SECRET, {algorithm: "HS256", expiresIn: "15m" });

        res.cookie("token", token, {
            httpOnly: true,                                // JS can't read it
            secure: process.env.NODE_ENV === "production", // HTTPS only in prod
            sameSite: "lax",                               // basic CSRF protection
            maxAge: 15 * 60 * 1000,
        });

        return res.status(200).json({message: "Login successful", user:{id: existingUser.id, username: existingUser.username}});

    } catch (error) {
        console.error("Login failed:", error);
        return res.status(500).json({ error: "Login failed" });
    }
}


export async function me(req:express.Request, res: express.Response){
    try{
        const user = await prisma.user.findUnique({
            where:{
                id: req.userId,
            },
            select:{
                id: true,
                username:true,
                email:true,
            },
        });

        if(!user){
            return res.status(401).json({message: "User not found"})
        }

        return res.status(200).json({user});

    }catch(error){
        return res.status(500).json({message: "Failed to validate session"});
    }
}

export async function logout(req:express.Request, res:express.Response){
    res.clearCookie("token",{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    })

    return res.status(200).json({message: "Logged out successfully"});
}