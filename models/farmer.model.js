import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
      },
    },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
    },
    profileUrl: {
      type: String,
      default: "https://example.com/default-profile.png",
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Reference to Products model
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Farmer = mongoose.model("Farmer", farmerSchema);
export default Farmer;
