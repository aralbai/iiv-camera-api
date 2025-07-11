import express from "express";
import {
  addCamera,
  deleteCamera,
  editCamera,
  getCameras,
} from "../controllers/cameras.js";

const router = express.Router();

router.post("/", addCamera);

router.get("/", getCameras);

router.put("/:id", editCamera);

router.delete("/:id", deleteCamera);

export default router;
