import express from "express";
import { drillSchema } from "@speako/common/common";
import { validate } from "../middleware/validate";
import { drills } from "../controllers/drill.controller";
import { requireAuth } from "../middleware/requireAuth";
import { jobEvents, jobStatus } from "../controllers/drill.controller";

export default(router: express.Router)=>{
    router.post("/api/drills",requireAuth, validate(drillSchema), drills)
    router.get("/jobs/:jobId",requireAuth, jobStatus)
    router.get("/jobs/:jobId/events",requireAuth, jobEvents)
}