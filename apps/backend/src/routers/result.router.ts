import express from "express";
import { requireAuth } from "../middleware/requireAuth";
import { getResults, getResultsById } from "../controllers/result.controller";

export default(router: express.Router) => {
    router.get("/progress/",requireAuth,getResults)
    router.get("/progress/:id",requireAuth, getResultsById)
}