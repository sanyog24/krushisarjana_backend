// controllers/retailerController.js
import Retailer from "../models/retailer.model.js";
import cloudinary from "../config/cloudinary.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js"

// ✅ Get Retailer Profile
export const getRetailerProfile = async (req, res) => {
  try {
    console.log("🔹 Received request to get retailer profile");
    console.log("🔹 Authenticated User ID:", req.user?.id);

    // Ensure `req.user.id` exists
    if (!req.user || !req.user.id) {
      console.log("❌ Error: User ID not found in request");
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    // Fetch retailer
    const retailer = await Retailer.findOne({ user: req.user.id }).populate("user", "-password");

    console.log("🔹 Fetched Retailer:", retailer);

    // Check if retailer exists
    if (!retailer) {
      console.log("❌ Error: Retailer not found in database");
      return res.status(404).json({ message: "Retailer not found" });
    }

    // Log final response before sending
    console.log("✅ Retailer Profile Found, Sending Response:", retailer);

    res.status(200).json(retailer);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// import { v2 as cloudinary } from "cloudinary";

export const upsertRetailerProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.warn("⚠️ Unauthorized Access Attempt!");
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    let retailer = await Retailer.findOne({ user: req.user.id });

    let profileUrl = retailer?.profileUrl || "";

    // Upload image to Cloudinary if a new file is provided
    if (req.file) {
      console.log("🔹 Uploading Image to Cloudinary...");
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "retailer_profiles", // Cloudinary folder
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      });

      profileUrl = result.secure_url; // Save Cloudinary URL
      console.log("✅ Image Uploaded to Cloudinary:", profileUrl);
    }

    if (retailer) {
      console.log("🔹 Updating Retailer Profile...");
      retailer.set({
        name: req.body.name,
        shopName: req.body.shopName,
        shopDescription: req.body.shopDescription,
        profileUrl,
        contact: {
          phone: req.body.phone,
          email: req.body.email,
        },
        address: {
          street: req.body.street,
          city: req.body.city,
          state: req.body.state,
          pincode: req.body.pincode,
          country: req.body.country,
        },
      });

      await retailer.save();
      return res.status(200).json({ message: "Retailer profile updated", retailer });
    } else {
      console.log("🔹 Creating New Retailer Profile...");
      const newRetailer = new Retailer({
        user: req.user.id,
        name: req.body.name,
        shopName: req.body.shopName,
        shopDescription: req.body.shopDescription,
        profileUrl,
        contact: {
          phone: req.body.phone,
          email: req.body.email,
        },
        address: {
          street: req.body.street,
          city: req.body.city,
          state: req.body.state,
          pincode: req.body.pincode,
          country: req.body.country,
        },
      });

      await newRetailer.save();
      return res.status(201).json({ message: "Retailer profile created", retailer: newRetailer });
    }
  } catch (error) {
    console.error("❌ [ERROR] Upsert Retailer Profile Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const addProduct = async (req, res) => {
  try {
    const { name, category, price, stock, unit, description, sellerType } = req.body;

    if (req.user.role === "Customer") {
      return res.status(403).json({ message: "Unauthorized: Only retailers can add products" });
    }

    let imageUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "product_images",
      });
      imageUrl = result.secure_url;
    }

    const product = new Product({
      name,
      category,
      price,
      stock,
      unit,
      description,
      image: imageUrl,
      seller: req.user.id,
      sellerType: sellerType  // ✅ Use sellerType from frontend, default to "Retailer" if missing
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Remove Product
export const removeProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own products" });
    }

    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product removed successfully" });
  } catch (error) {
    console.error("Remove Product Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Edit Product
export const editProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, category, price, stock, unit, description } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You can only edit your own products" });
    }

    let imageUrl = product.image;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "product_images",
      });
      imageUrl = result.secure_url;
    }

    product.set({ name, category, price, stock, unit, description, image: imageUrl });
    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Edit Product Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get Products (Uploaded by this Retailer)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id });
    res.status(200).json(products);
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get All Products (Uploaded by all Retailers)
export const getAllProducts = async (req, res) => {
  try {
    // ✅ Fetch products from both Retailers & Farmers
    const products = await Product.find({
      sellerType: { $in: ["Retailer", "Farmer"] }, // Fetch all types
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Get All Products Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params; // Extract category from request parameters

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    // Find products that match the given category
    const products = await Product.find({ category });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found for this category" });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate("seller", "name role");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getAllProductsByName = async (req, res) => {
  try {
    // console.log("[getAllProductsByName] Request received - Params:", req.params, "Query:", req.query);

    // Extract correct parameter (productName instead of name)
    let { productName } = req.params;
    if (!productName) {
      productName = req.query.productName; // Fallback to query if not in params
    }

    // Ensure productName is valid
    if (!productName || productName.trim() === "") {
      // console.log("[getAllProductsByName] Product name missing in request");
      return res.status(400).json({ message: "Product name is required" });
    }

    // console.log("[getAllProductsByName] Searching for products with name:", productName);

    const products = await Product.find({ 
      name: { $regex: new RegExp(productName.trim(), "i") } // Case-insensitive regex search
    });

    if (!products || products.length === 0) {
      // console.log("[getAllProductsByName] No products found with name:", productName);
      return res.status(404).json({ message: "No products found with this name" });
    }

    // console.log("[getAllProductsByName] Products found:", products);
    res.status(200).json(products);
  } catch (error) {
    console.error("[getAllProductsByName] Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// Review Controllers

// ✅ Add a Review
export const addReview = async (req, res) => {
  try {
    console.log("📩 Received request body:", req.body);
    console.log("🔑 Authenticated user:", req.user);

    const { rating, comment } = req.body;
    const { productId } = req.params;

    // Validate input
    if (!rating || !comment) {
      console.log("❌ Missing rating or comment");
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    // Find the full user details (fixing missing user data issue)
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      console.log("❌ Product not found");
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === user._id.toString()
    );
    if (alreadyReviewed) {
      console.log("⚠️ User has already reviewed this product");
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    // Create review object
    const review = {
      user: user._id,
      userName: user.name, // Ensure user name is fetched
      userRole: user.role, // "Customer" or "Farmer"
      userProfileImage: user.profileImage || "", // Ensure profile image exists
      rating: Number(rating), // Ensure rating is a number
      comment,
      createdAt: new Date(),
    };

    // Add review to product
    product.reviews.push(review);

    // Recalculate average rating
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    console.log("✅ Review added successfully:", review);
    res.status(201).json({
      message: "Review added successfully",
      reviews: product.reviews,
      averageRating: product.rating.toFixed(1), // Return updated average rating
    });
  } catch (error) {
    console.error("❌ Error adding review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get all reviews for a product
export const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).select("reviews");
    
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product.reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Delete a Review
export const deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const user = req.user;

    // Find product
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Find the review
    const reviewIndex = product.reviews.findIndex((r) => r._id.toString() === reviewId);
    if (reviewIndex === -1) return res.status(404).json({ message: "Review not found" });

    const review = product.reviews[reviewIndex];

    // Check if the user is the owner of the review or an admin
    if (review.user.toString() !== user._id.toString() && user.role !== "Admin") {
      return res.status(403).json({ message: "Unauthorized to delete this review" });
    }

    // Remove the review
    product.reviews.splice(reviewIndex, 1);
    await product.save();

    res.json({ message: "Review deleted successfully", reviews: product.reviews });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

