import dotenv from "dotenv";
dotenv.config(); // Load environment variables

import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";
import mongoose from "mongoose";

// Ensure Stripe key is set
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing in the .env file");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @desc Create a new order
 * @route POST /api/orders
 */
export const createOrder = async (req, res) => {
  try {
    console.log("[createOrder] Request received");
    
    // Check database connection - try reconnection if needed
    if (mongoose?.connection?.readyState !== 1) {
      console.warn("[createOrder] Database not connected. State:", mongoose?.connection?.readyState || 'undefined', '- Attempting reconnection...');
      try {
        if (mongoose.connection.readyState === 0 && process.env.MONGODB_URI) {
          await mongoose.connect(process.env.MONGODB_URI);
          console.log("[createOrder] Reconnection successful");
        }
      } catch (reconnectError) {
        console.error("[createOrder] Reconnection failed:", reconnectError.message);
        return res.status(503).json({ message: "Database connection unavailable", error: reconnectError.message });
      }
    }

    const { buyerId, productId, paymentId, subTotalAmount, totalAmount, paymentStatus, paymentMethod } = req.body;
    console.log("[createOrder] Buyer:", buyerId);
    console.log("[createOrder] Product:", productId);
    console.log("[createOrder] Payment ID:", paymentId);
    console.log("[createOrder] Payment Method:", paymentMethod);
    console.log("[createOrder] Payment Status:", paymentStatus);
    console.log("[createOrder] SubTotal:", subTotalAmount);
    console.log("[createOrder] Total:", totalAmount);

    if (!buyerId || !productId || !paymentId || !subTotalAmount || !totalAmount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const buyer = await User.findById(buyerId);
    if (!buyer) return res.status(404).json({ message: "Buyer not found" });
    console.log("[createOrder] Buyer found:", buyer._id, buyer.name);

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    console.log("[createOrder] Product found:", product._id, product.name);
    console.log("[createOrder] Product seller ID:", product.seller);

    if (!product.seller) {
      console.error("[createOrder] Product has no seller assigned");
      return res.status(400).json({ message: "Product has no seller assigned" });
    }

    const seller = await User.findById(product.seller);
    if (!seller) {
      console.error("[createOrder] Seller not found for ID:", product.seller);
      return res.status(404).json({ message: "Seller not found" });
    }
    console.log("[createOrder] Seller found:", seller._id, seller.name);

    // Use provided payment status or default to "Pending"
    const finalPaymentStatus = paymentStatus || "Pending";
    const finalPaymentMethod = paymentMethod || "Unknown";

    const newOrder = new Order({
      orderId: uuidv4(),
      buyer: { 
        _id: new mongoose.Types.ObjectId(buyer._id), 
        name: buyer.name, 
        role: buyer.role 
      },
      product: {
        _id: new mongoose.Types.ObjectId(product._id),
        name: product.name,
        image : product.image,
        seller: { 
          _id: new mongoose.Types.ObjectId(seller._id), 
          name: seller.name, 
          role: seller.role 
        },
      },
      paymentId,
      paymentMethod: finalPaymentMethod,
      paymentStatus: finalPaymentStatus,
      subTotalAmount,
      totalAmount,
      orderStatus: finalPaymentStatus === "Paid" ? "Accepted" : "Pending",
    });

    console.log("[createOrder] New order object:", JSON.stringify(newOrder, null, 2));
    await newOrder.save();
    console.log("[createOrder] Order saved successfully:", newOrder._id);
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Create Order Error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

/**
 * @desc Get orders for a user
 * @route GET /api/orders/:userId
 */
export const getUserOrders = async (req, res) => {
  try {
    console.log("[getUserOrders] Request received");
    
    // Check database connection - try reconnection if needed
    if (mongoose?.connection?.readyState !== 1) {
      console.warn("[getUserOrders] Database not connected. State:", mongoose?.connection?.readyState || 'undefined', '- Attempting reconnection...');
      try {
        if (mongoose.connection.readyState === 0 && process.env.MONGODB_URI) {
          await mongoose.connect(process.env.MONGODB_URI);
          console.log("[getUserOrders] Reconnection successful");
        }
      } catch (reconnectError) {
        console.error("[getUserOrders] Reconnection failed:", reconnectError.message);
        return res.status(503).json({ message: "Database connection unavailable", error: reconnectError.message });
      }
    }

    const { userId } = req.params;
    console.log("[getUserOrders] User ID from params:", userId);
    console.log("[getUserOrders] User ID type:", typeof userId);
    
    if (!userId) {
      console.error("[getUserOrders] User ID is missing");
      return res.status(400).json({ message: "User ID is required" });
    }

    // Convert userId string to ObjectId for proper MongoDB query
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(userId);
      console.log("[getUserOrders] Converted to ObjectId:", objectId);
    } catch (err) {
      console.error("[getUserOrders] Invalid ObjectId format:", err.message);
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // First, let's check all orders to see what's in the database
    const allOrders = await Order.find({}).limit(5);
    console.log("[getUserOrders] Sample of all orders in DB:", JSON.stringify(allOrders, null, 2));

    // Now query for this specific user
    const orders = await Order.find({
      $or: [{ "buyer._id": objectId }, { "product.seller._id": objectId }],
    });

    console.log(`[getUserOrders] Found ${orders.length} orders for user ${userId}`);
    console.log("[getUserOrders] Orders found:", JSON.stringify(orders, null, 2));

    if (!orders.length) {
      return res.status(200).json([]); // Return empty array instead of 404
    }
    
    res.status(200).json(orders);
  } catch (error) {
    console.error("[getUserOrders] Error:", error);
    console.error("[getUserOrders] Error stack:", error.stack);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

/**
 * @desc Update order status
 * @route PUT /api/orders/:orderId/status
 */

// Ensure the correct path for your Order model

export const updateOrderStatus = async (req, res) => {
  try {
    console.log("Received request to update order status.");
    console.log("Request Headers:", req.headers);
    console.log("Request Body:", req.body);
    console.log("Request Params:", req.params);

    const { orderId } = req.params;
    if (!orderId) {
      console.error("Order ID is missing in request parameters.");
      return res.status(400).json({ message: "Order ID is required." });
    }
    console.log(`Updating order with ID: ${orderId}`);

    const { orderStatus, paymentStatus } = req.body;
    console.log("Received data:", { orderStatus, paymentStatus });

    if (orderStatus === undefined || paymentStatus === undefined) {
      console.error("Received undefined values for orderStatus or paymentStatus.");
      return res.status(400).json({ message: "Order status and payment status are required." });
    }

    // Validate order status
    const validOrderStatuses = ["Pending", "Accepted", "Rejected", "Completed"];
    if (!validOrderStatuses.includes(orderStatus)) {
      console.error(`Invalid order status received: ${orderStatus}`);
      return res.status(400).json({ message: "Invalid order status." });
    }
    console.log("Order status is valid.");

    // Validate payment status
    const validPaymentStatuses = ["Paid", "Failed", "Pending"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      console.error(`Invalid payment status received: ${paymentStatus}`);
      return res.status(400).json({ message: "Invalid payment status." });
    }
    console.log("Payment status is valid.");

    console.log("Attempting to find and update order...");
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { orderStatus, paymentStatus } },
      { new: true }
    );

    if (!updatedOrder) {
      console.error("Order not found in database.");
      return res.status(404).json({ message: "Order not found." });
    }

    console.log("Order updated successfully:", updatedOrder);
    res.status(200).json({ message: "Order updated successfully.", order: updatedOrder });

  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    console.log("Received request to delete order.");
    console.log("Request Headers:", req.headers);
    console.log("Request Params:", req.params);

    const { orderId } = req.params;
    if (!orderId) {
      console.error("Order ID is missing in request parameters.");
      return res.status(400).json({ message: "Order ID is required." });
    }

    console.log(`Attempting to find and delete order with ID: ${orderId}`);
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      console.error("Order not found in database.");
      return res.status(404).json({ message: "Order not found." });
    }

    console.log("Order deleted successfully:", deletedOrder);
    res.status(200).json({ message: "Order deleted successfully.", order: deletedOrder });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};


/**
 * @desc Create Stripe Payment Intent
 * @route POST /api/orders/checkout
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ message: "Amount and currency are required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe requires amount in cents
      currency,
      payment_method_types: ["card"],
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Create Payment Intent Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
