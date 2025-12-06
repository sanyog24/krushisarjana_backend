import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    buyer: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      profileImage: {
        type: String,
      },
      role: {
        type: String,
        enum: ["Customer", "Farmer"],
        required: true,
      },
    },
    product: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      image: {
        type: String,
      },
      seller: {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          enum: ["Farmer", "Retailer"],
          required: true,
        },
      },
    },
    paymentId: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Failed", "Pending"],
      default: "Pending",
    },
    subTotalAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    invoiceReceipt: {
      type: String,
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Completed"],
      default: "Pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
