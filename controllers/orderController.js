import dotenv from "dotenv";
dotenv.config(); // Load environment variables

import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";

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
    const { buyerId, productId, paymentId, subTotalAmount, totalAmount } = req.body;
    console.log("Buyer : " + buyerId);
    console.log("Product : " + productId);
    console.log(paymentId);
    console.log(subTotalAmount);
    console.log(totalAmount);

    if (!buyerId || !productId || !paymentId || !subTotalAmount || !totalAmount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const buyer = await User.findById(buyerId);
    if (!buyer) return res.status(404).json({ message: "Buyer not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const seller = await User.findById(product.seller);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const newOrder = new Order({
      orderId: uuidv4(),
      buyer: { _id: buyer._id, name: buyer.name, role: buyer.role },
      product: {
        _id: product._id,
        name: product.name,
        image : product.image,
        seller: { _id: seller._id, name: seller.name, role: seller.role },
      },
      paymentId,
      paymentStatus: "Pending",
      subTotalAmount,
      totalAmount,
      orderStatus: "Pending",
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @desc Get orders for a user
 * @route GET /api/orders/:userId
 */
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const orders = await Order.find({
      $or: [{ "buyer._id": userId }, { "product.seller._id": userId }],
    });

    if (!orders.length) return res.status(404).json({ message: "No orders found" });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Get User Orders Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
