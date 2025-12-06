import mongoose from "mongoose";

const userLocationSchema = new mongoose.Schema({
//   name: { type: String, required: true },
  email: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

export default mongoose.model("UserLocation", userLocationSchema);
