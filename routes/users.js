import express from "express";
import { deleteUser, editUser, getUsers } from "../controllers/users.js";

const router = express.Router();

router.get("/", getUsers);

router.delete("/:id", deleteUser);

router.put("/:id", editUser);

export default router;
