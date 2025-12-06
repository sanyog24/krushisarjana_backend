import express from "express";
import {
  addProduct,
  removeProduct,
  editProduct,
  getProducts,
  getAllProducts,
  getProductsByCategory,
  getProductById, 
  addReview, getReviews, deleteReview,// Import the new controller
  getAllProductsByName
} from "../controllers/retailerController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import upload from "../utils/multer.js"; // Middleware for image upload

const router = express.Router();

// ✅ Add Product (Protected Route, with image upload)
router.post("/add-product", authMiddleware, roleMiddleware(["Retailer", "Farmer"]), upload.single("productImage"), addProduct);

// ✅ Remove Product (Protected Route)
router.delete("/remove-product/:productId", authMiddleware, roleMiddleware(["Retailer", "Farmer"]), removeProduct);

// ✅ Edit Product (Protected Route)
router.put("/edit-product/:productId", authMiddleware, roleMiddleware(["Retailer", "Farmer"]), upload.single("productImage"), editProduct);

// ✅ Get Products uploaded by the Retailer (Protected Route)
router.get("/my-products", authMiddleware, roleMiddleware(["Retailer", "Farmer"]), getProducts);

// ✅ Get All Products uploaded by all Retailers (Public Route)
router.get("/all-products", getAllProducts);

// ✅ Get Products by Category (Public Route)
router.get("/category/:category", getProductsByCategory);

router.get("/product/:productId", getProductById);

router.get("/name/:productName", getAllProductsByName);

// ✅ Add a review (Only authenticated users can post a review)
router.post("/:productId/review", authMiddleware, addReview);

// ✅ Get all reviews for a product (Public route)
router.get("/:productId/reviews", getReviews);

// ✅ Delete a review (Only the review owner or an Admin can delete a review)
router.delete("/:productId/review/:reviewId", authMiddleware, deleteReview);


export default router;
