import express from "express";
import { createOrder, getUserOrders, updateOrderStatus, createPaymentIntent, deleteOrder } from "../controllers/orderController.js";
import Order from "../models/order.model.js";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-order", createOrder);
router.get("/:userId", getUserOrders);
router.put("/:orderId/status", updateOrderStatus);
router.post("/payment-intent", createPaymentIntent);
router.delete("/:orderId/cancel", deleteOrder);

// ✅ Create Stripe Checkout Session
router.post("/checkout", async (req, res) => {
  try {
    const { items, userId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid order items" });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name, images: [item.image] },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: { userId },
    });

    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("Checkout Session Error:", error);
    res.status(500).json({ success: false, message: "Error creating checkout session", error: error.message });
  }
});

// ✅ Handle Stripe Webhook for Payment Confirmation
router.post("/webhook", async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata.userId;

      const order = await Order.findOneAndUpdate(
        { "buyer._id": userId, paymentStatus: "Pending" }, 
        { paymentStatus: "Paid" }, 
        { new: true }
      );

      if (order) {
        console.log("✅ Order marked as paid:", order._id);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

export default router;
