import Customer from "../models/customer.model.js";
import cloudinary from "../config/cloudinary.js";

/**
 * @desc   Create or Update Customer Profile
 * @route  POST /api/customer/upsert
 * @access Private (User must be authenticated)
 */
export const upsertCustomer = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log("🔹 Received User ID:", userId);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access." });
    }

    console.log("🔹 Raw Request Body:", req.body);
    console.log("🔹 Received File:", req.file);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "Request body is empty. Ensure correct Content-Type is used." });
    }

    // Parse fields explicitly
    const name = req.body.name?.trim() || "";
    const phone = req.body.phone?.trim() || "";
    const email = req.body.email?.trim() || "";
    const street = req.body.street?.trim() || "";
    const city = req.body.city?.trim() || "";
    const state = req.body.state?.trim() || "";
    const pincode = req.body.pincode?.trim() || "";
    const country = req.body.country?.trim() || "";

    let profileUrl;

    // Handle Image Upload to Cloudinary
    if (req.file && req.file.path) {
      try {
        console.log("⏳ Uploading image to Cloudinary...");
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "customer_profiles",
          transformation: [{ width: 300, height: 300, crop: "fill" }],
        });
        profileUrl = result.secure_url;
        console.log("✅ Image uploaded successfully:", profileUrl);
      } catch (uploadError) {
        console.error("❌ Cloudinary Upload Error:", uploadError);
        return res.status(500).json({ success: false, message: "Image upload failed. Please try again." });
      }
    }

    // Check if the customer already exists
    let customer = await Customer.findOne({ user: userId });

    if (customer) {
      console.log("🔹 Existing customer found, updating...");

      // Explicitly assign all fields
      customer.name = name || customer.name;
      customer.contact = {
        phone: phone !== "" ? phone : customer.contact?.phone || "",
        email: email !== "" ? email : customer.contact?.email || "",
      };
      customer.address = {
        street: street !== "" ? street : customer.address?.street || "",
        city: city !== "" ? city : customer.address?.city || "",
        state: state !== "" ? state : customer.address?.state || "",
        pincode: pincode !== "" ? pincode : customer.address?.pincode || "",
        country: country !== "" ? country : customer.address?.country || "",
      };

      if (profileUrl) customer.profileUrl = profileUrl;

      await customer.save();
      console.log("✅ Profile updated successfully:", customer);
      return res.status(200).json({ success: true, message: "Profile updated successfully.", customer });
    } else {
      console.log("🔹 No existing customer, creating new profile...");

      customer = new Customer({
        user: userId,
        name,
        contact: { phone, email },
        address: { street, city, state, pincode, country },
        profileUrl: profileUrl || "https://example.com/default-profile.png",
      });

      await customer.save();
      console.log("✅ New profile created:", customer);
      return res.status(201).json({ success: true, message: "Profile created successfully.", customer });
    }
  } catch (error) {
    console.error("❌ Error in upsertCustomer:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

/**
 * @desc   Get Customer Profile
 * @route  GET /api/customer
 * @access Private (User must be authenticated)
 */
export const getCustomerDetails = async (req, res) => {
  try {
    const userId = req.user?.id;
    // console.log("🔹 Fetching profile for User ID:", userId);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access." });
    }

    const customer = await Customer.findOne({ user: userId })
      .populate("user", "name email");

    if (!customer) {
      console.log("❌ Customer profile not found for User ID:", userId);
      return res.status(404).json({ success: false, message: "Customer profile not found." });
    }

    // console.log("✅ Profile found:", customer);
    return res.status(200).json({ success: true, customer });
  } catch (error) {
    console.error("❌ Error in getCustomerDetails:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};
