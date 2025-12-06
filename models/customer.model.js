import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
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
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Customer", customerSchema);

// import mongoose from "mongoose";

// const customerSchema = new mongoose.Schema({
//   name: { type: String, default: "" },  // Ensure empty string is stored if missing
//   contact: {
//     phone: { type: String, default: "" },
//     email: { type: String, default: "" },
//   },
//   address: {
//     street: { type: String, default: "" },
//     city: { type: String, default: "" },
//     state: { type: String, default: "" },
//     pincode: { type: String, default: "" },
//     country: { type: String, default: "" },
//   },
//   profileUrl: {
//     type: String,
//     default: "https://example.com/default-profile.png",
//   },
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.model("Customer", customerSchema);

