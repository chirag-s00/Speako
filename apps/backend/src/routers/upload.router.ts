import express from "express";
import { requireAuth } from "../middleware/requireAuth";
import { uploadFile } from "../controllers/upload.controller";
import { validate } from "../middleware/validate";
import { uploadSchema } from "@speako/common/common";

export default(router: express.Router) => {
  router.post("/uploads/presigned-url",requireAuth,validate(uploadSchema), uploadFile);
}