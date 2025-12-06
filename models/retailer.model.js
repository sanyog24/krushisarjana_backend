import mongoose from "mongoose";

const retailerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: { type: String,  },
  contact: {
    phone: { type: String,  },
    email: { type: String,  },
  },
  address: {
    street: { type: String},
    city: { type: String},
    state: { type: String},
    pincode: { type: String},
    country: { type: String},
  },
  profileUrl: {
    type: String,
    default: "https://example.com/default-profile.png",
  },
  shopName: { type: String},
  shopDescription: { type: String },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // Reference to Product model
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Retailer", retailerSchema);
