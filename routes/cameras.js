import express from "express";
import { addCamera, getCameras } from "../controllers/cameras.js";

const router = express.Router();

router.post("/", addCamera);

router.get("/", getCameras);

export default router;
