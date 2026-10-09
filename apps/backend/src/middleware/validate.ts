import {ZodType} from 'zod';
import z from 'zod';
import express from 'express';

export const validate = <T>(schema:ZodType<T,any,any>) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({error: "Invalid input",
                details: z.flattenError(result.error).fieldErrors, })
        }
        req.body = result.data;
        next();
    }