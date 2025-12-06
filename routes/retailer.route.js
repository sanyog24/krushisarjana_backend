import express from "express";
import {
  getRetailerProfile,
  upsertRetailerProfile,
  addProduct,
  removeProduct,
  editProduct,
  getProducts,
  getAllProducts
} from "../controllers/retailerController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import upload from "../utils/multer.js"; // Middleware for image upload

const router = express.Router();

// ✅ Get Retailer Profile (Protected Route)
router.get("/get-profile", authMiddleware, roleMiddleware(["Retailer"]), getRetailerProfile);

// ✅ Create or Update Retailer Profile (Protected Route, with optional image upload)
router.post("/profile", authMiddleware, roleMiddleware(["Retailer"]), upload.single("profileImage"), upsertRetailerProfile);

// ✅ Add Product (Protected Route, with image upload)
// router.post("/add-product", authMiddleware, roleMiddleware(["Retailer"]), upload.single("productImage"), addProduct);

// // ✅ Remove Product (Protected Route)
// router.delete("/remove-product/:productId", authMiddleware, roleMiddleware(["Retailer"]), removeProduct);

// // ✅ Edit Product (Protected Route)
// router.put("/edit-product/:productId", authMiddleware, roleMiddleware(["Retailer"]), upload.single("productImage"), editProduct);

// // ✅ Get Products uploaded by the Retailer (Protected Route)
// router.get("/my-products", authMiddleware, roleMiddleware(["Retailer"]), getProducts);

// // ✅ Get All Products uploaded by all Retailers (Public Route)
// router.get("/all-products", getAllProducts);

export default router;
