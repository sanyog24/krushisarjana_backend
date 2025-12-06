import express from "express";
import { upsertCustomer, getCustomerDetails } from "../controllers/customerController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../utils/multer.js"; // Import Multer

const router = express.Router();

// Route to create or update a customer (with image upload)
router.post("/upsert", authMiddleware, upload.single("profileImage"), upsertCustomer);

// Route to get customer details by user ID
router.get("/customer-details", authMiddleware, getCustomerDetails);

export default router;
