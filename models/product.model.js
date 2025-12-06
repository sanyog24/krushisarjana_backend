import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model to accommodate Farmers and Customers
    required: true,
  },
  userName: { type: String, required: true }, // Store the reviewer's name
  userRole: {
    type: String,
    enum: ["Customer", "Farmer"], // Role of the reviewer
    required: true,
  },
  userProfileImage: { type: String, 
    // required: true 
  }, // Store user profile image URL
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        if (!this.sellerType) return false; // Ensure sellerType exists before validation

        const farmerCategories = ["Vegetables", "Fruits", "Grains", "Cereals"];
        const retailerCategories = ["Seeds", "Pesticides", "Equipments"];

        if (this.sellerType === "Farmer") {
          return farmerCategories.includes(value);
        } else if (this.sellerType === "Retailer") {
          return retailerCategories.includes(value);
        }
        return false;
      },
      message: (props) => `Invalid category '${props.value}' for seller type '${props.instance.sellerType || "undefined"}'`,
    },
  },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  unit: {
    type: String,
    enum: ["Kg", "Litre", "Grams", "Piece", "Dozen", "Quintals"],
    required: true,
  },
  description: { type: String },
  image: { type: String }, // Store image URL
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Dynamic reference to User model
    required: true,
  },
  sellerType: {
    type: String,
    enum: ["Farmer", "Retailer"], // Defines whether the seller is a Farmer or Retailer
    required: true,
  },
  reviews: [reviewSchema], // Array of reviews specific to this product
  createdAt: { type: Date, default: Date.now },
});

// Middleware to ensure sellerType is set before validation
productSchema.pre("validate", function (next) {
  if (!this.sellerType) {
    return next(new Error("Seller type is required"));
  }
  next();
});

// Middleware to ensure category matches seller type before saving
productSchema.pre("save", function (next) {
  const farmerCategories = ["Vegetables", "Fruits", "Grains", "Cereals"];
  const retailerCategories = ["Seeds", "Pesticides", "Equipments"];

  if (this.sellerType === "Farmer" && !farmerCategories.includes(this.category)) {
    return next(new Error("Invalid category for a Farmer"));
  } 
  if (this.sellerType === "Retailer" && !retailerCategories.includes(this.category)) {
    return next(new Error("Invalid category for a Retailer"));
  }
  
  next();
});

export default mongoose.model("Product", productSchema);
