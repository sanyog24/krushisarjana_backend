import Farmer from "../models/farmer.model.js";
import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js"; // Assuming Cloudinary is set up in config
import mongoose from "mongoose";

/**
 * @desc    Create or Update Farmer Profile
 * @route   POST /api/farmer
 * @access  Private (User-specific)
 */
export const upsertFarmer = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated via middleware
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

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Check if the farmer exists
    let farmer = await Farmer.findOne({ user: userId });

    // Handle profile image upload
    let profileUrl = farmer?.profileUrl || "https://example.com/default-profile.png";
    if (req.file) {
      const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
        folder: "farmers",
      });
      profileUrl = uploadedImage.secure_url;
    }

    if (!farmer) {
      // Create a new farmer profile
      farmer = new Farmer({
        user: userId,
        name,
        contact: { phone, email },
        address: { street, city, state, pincode, country },
        profileUrl,
        products: products ? products.split(",") : [],
      });
    } else {
      // Update existing farmer profile
      farmer.name = name;
      farmer.contact.phone = phone;
      farmer.contact.email = email;
      farmer.address.street = street;
      farmer.address.city = city;
      farmer.address.state = state;
      farmer.address.pincode = pincode;
      farmer.address.country = country;
      farmer.profileUrl = profileUrl;
      farmer.products = products ? products.split(",") : farmer.products;
    }

    const savedFarmer = await farmer.save();
    res.status(200).json({ message: "Farmer profile updated", farmer: savedFarmer });

  } catch (error) {
    console.error("Error in upsertFarmer:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
