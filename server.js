import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import retailerRoutes from './routes/retailer.route.js';
import productRoutes from './routes/product.route.js';
import customerRoutes from './routes/customer.route.js'
import farmerRoutes from './routes/farmer.route.js'
import orderRoutes from './routes/order.route.js'

// ✅ Load environment variables
dotenv.config();

// ✅ Connect to Database
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database Connection Failed:", error);
    process.exit(1); // Exit if DB fails to connect
  }
};

// ✅ Initialize Express App
const app = express();

// ✅ Middleware Setup
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true, // Allows sending cookies across origins
  })
);
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/retailers", retailerRoutes);
app.use("/api/products", productRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/farmers", farmerRoutes)
app.use("/api/orders", orderRoutes)

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await startServer();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});