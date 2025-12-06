// import express from "express";
// import { upsertFarmer, getFarmerDetails } from "../controllers/farmerController.js";
// import { authMiddleware } from "../middleware/authMiddleware.js"; // Middleware for authentication
// import upload from "../utils/multer.js"; // Importing multer from your utils folder

// const router = express.Router();

// // Route to create/update farmer profile
// router.post("/upsert-farmer", authMiddleware, upload.single("profileImage"), upsertFarmer);

// // Route to get farmer details
// router.get("/get-farmer", authMiddleware, getFarmerDetails);

// export default router;

import express from "express";
import { upsertFarmer, getFarmerDetails, getFarmerById } from "../controllers/farmerController.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; // Middleware for authentication
import upload from "../utils/multer.js"; // Importing multer from your utils folder

const router = express.Router();

// Route to create/update farmer profile
router.post("/upsert-farmer", authMiddleware, upload.single("profileImage"), upsertFarmer);

// Route to get authenticated farmer details (by user ID)
router.get("/get-farmer", authMiddleware, getFarmerDetails);

// Route to get farmer details by farmer ID (public)
router.get("/get-farmer/:farmerId", getFarmerById);

export default router;

