import express from "express";
import { registerUser, loginUser, logoutUser, getUserById } from "../controllers/authController.js";
import {authMiddleware} from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/user/:id", authMiddleware, getUserById);

export default router;
