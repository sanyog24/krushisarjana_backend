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
    return;
  }
  try {
    await connectDB();
    isConnected = true;
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database Connection Failed:", error);
    isConnected = false;
  }
};

// Initialize DB connection
connectToDatabase().catch(console.error);

// ✅ Health check route
app.get("/", (req, res) => {
  res.json({ 
    message: "Backend is running!", 
    status: "healthy",
    dbConnected: isConnected 
  });
});

app.get("/api", (req, res) => {
  res.json({ 
    message: "API is working!", 
    status: "healthy" 
  });
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/retailers", retailerRoutes);
app.use("/api/products", productRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/farmers", farmerRoutes)
app.use("/api/orders", orderRoutes)

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ 
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// ✅ Start Server (for local development)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// ✅ Export for Vercel serverless
export default app;