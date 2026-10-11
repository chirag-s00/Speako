import express from "express";
import { drillSchema } from "@speako/common/common";
import { validate } from "../middleware/validate";
import { drills } from "../controllers/drill.controller";
import { requireAuth } from "../middleware/requireAuth";

export default(router: express.Router)=>{
    router.post("/drills",requireAuth, validate(drillSchema), drills)

}