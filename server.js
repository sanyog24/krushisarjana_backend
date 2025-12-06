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

// ✅ Initialize Express App
const app = express();

// ✅ Middleware Setup
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://krushi-sarjana.vercel.app"], // Frontend URLs
    credentials: true, // Allows sending cookies across origins
  })
);
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to Database (for Vercel serverless)
let isConnected = false;
const connectToDatabase = async () => {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }
  try {
    await connectDB();
    isConnected = true;
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database Connection Failed:", error);
    throw error;
  }
};

// ✅ Routes with DB connection middleware
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/retailers", retailerRoutes);
app.use("/api/products", productRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/farmers", farmerRoutes)
app.use("/api/orders", orderRoutes)

// ✅ Health check route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!", status: "healthy" });
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Start Server (for local development)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    await connectToDatabase();
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// ✅ Export for Vercel serverless
export default app;