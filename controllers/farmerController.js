import Farmer from "../models/farmer.model.js";
import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js"; // Assuming Cloudinary is set up in config
import mongoose from "mongoose";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

/**
 * @desc    Create or Update Farmer Profile
 * @route   POST /api/farmer
 * @access  Private (User-specific)
 */
export const upsertFarmer = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated via middleware
    
    // Parse address if it's sent as JSON string (from mobile app)
    let addressData = {};
    if (req.body.address) {
      try {
        addressData = typeof req.body.address === 'string' 
          ? JSON.parse(req.body.address) 
          : req.body.address;
      } catch (e) {
        console.error("Error parsing address:", e);
        addressData = {};
      }
    }
    
    const {
      name,
      phone,
      email,
      street,
      city,
      state,
      pincode,
      country,
      products,
    } = req.body;

    // Use parsed address data or individual fields
    const addressFields = {
      street: addressData.street || street || '',
      city: addressData.city || city || '',
      state: addressData.state || state || '',
      pincode: addressData.pincode || pincode || '',
      country: addressData.country || country || 'India',
    };

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Check if the farmer exists
    let farmer = await Farmer.findOne({ user: userId });

    // Handle profile image upload
    let profileUrl = farmer?.profileUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    if (req.file) {
      try {
        const uploadedImage = await uploadToCloudinary(req.file.buffer, "farmers");
        profileUrl = uploadedImage.secure_url;
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        // Continue without updating profile image
      }
    }

    if (!farmer) {
      // Create a new farmer profile
      farmer = new Farmer({
        user: userId,
        name: name || '',
        contact: { 
          phone: phone || '', 
          email: email || req.user.email || '' 
        },
        address: addressFields,
        profileUrl,
        products: products ? products.split(",") : [],
      });
    } else {
      // Update existing farmer profile
      if (name) farmer.name = name;
      if (phone) farmer.contact.phone = phone;
      if (email) farmer.contact.email = email;
      
      // Update address fields
      farmer.address = {
        ...farmer.address,
        ...addressFields
      };
      
      farmer.profileUrl = profileUrl;
      if (products) farmer.products = products.split(",");
    }

    const savedFarmer = await farmer.save();
    res.status(200).json({ 
      success: true,
      message: "Farmer profile updated", 
      farmer: savedFarmer 
    });

  } catch (error) {
    console.error("Error in upsertFarmer:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get Farmer Details
 * @route   GET /api/farmer
 * @access  Private (User-specific)
 */
export const getFarmerDetails = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated via middleware

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const farmer = await Farmer.findOne({ user: userId }).populate("products");

    if (!farmer) {
      return res.status(404).json({ message: "Farmer profile not found" });
    }

    res.status(200).json({ farmer });

  } catch (error) {
    console.error("Error in getFarmerDetails:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getFarmerById = async (req, res) => {
  try {
    console.log("🟢 Incoming Request to getFarmerById");

    // Extract farmerId from request parameters
    const { farmerId } = req.params;
    console.log("📌 Extracted farmerId:", farmerId);

    // Check if farmerId is provided
    if (!farmerId) {
      console.error("❌ Error: Farmer ID is missing in request");
      return res.status(400).json({ message: "Farmer ID is required" });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      console.error("❌ Error: Invalid farmer ID format", farmerId);
      return res.status(400).json({ message: "Invalid farmer ID" });
    }
    console.log("✅ Farmer ID is valid");

    // 🔍 Find farmer by `user` field
    console.log("🔍 Searching for farmer with user ID:", farmerId);
    const farmer = await Farmer.findOne({ user: farmerId });

    // If farmer not found, perform additional check by `_id`
    if (!farmer) {
      console.warn(`⚠️ No farmer found for user ID: ${farmerId}, trying _id lookup...`);
      const farmerById = await Farmer.findById(farmerId);
      if (farmerById) {
        console.log("✅ Farmer found using _id lookup:", farmerById);
        return res.status(200).json({ farmer: farmerById });
      } else {
        console.warn(`⚠️ No farmer found for _id: ${farmerId}`);
        return res.status(404).json({ message: "Farmer not found" });
      }
    }

    console.log("✅ Farmer found:", farmer);
    res.status(200).json({ farmer });

  } catch (error) {
    console.error("🔥 Internal Server Error in getFarmerById:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
