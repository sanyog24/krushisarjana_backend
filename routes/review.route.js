import express from "express";
import Product from "../models/productModel.js";
import { protect } from "../middleware/authMiddleware.js"; // Ensure only logged-in users can review

const router = express.Router();

// Submit a review
router.post("/:productId/review", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const user = req.user; // Retrieved from auth middleware

    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find((r) => r.user.toString() === user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ message: "You have already reviewed this product" });

    const review = {
      user: user._id,
      userName: user.name,
      userRole: user.role, // "Customer" or "Farmer"
      userProfileImage: user.profileImage,
      rating,
      comment,
    };

    product.reviews.push(review);
    await product.save();
    
    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
