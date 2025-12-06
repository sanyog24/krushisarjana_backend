import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.js";
import retailerRoutes from './routes/retailer.route.js';
import productRoutes from './routes/product.route.js';
import customerRoutes from './routes/customer.route.js';
import farmerRoutes from './routes/farmer.route.js';
import orderRoutes from './routes/order.route.js';

// ✅ Initialize Express App
const app = express();

// ✅ Middleware Setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://krushi-sarjana.vercel.app"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  })
);

// ✅ MongoDB Connection with caching for Vercel
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    console.log('Creating new database connection...');
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB Connected');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB Connection Error:', error.message);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Failed to establish database connection:', e.message);
    throw e;
  }

  return cached.conn;
}

// ✅ Connect DB on startup
dbConnect().catch(err => {
  console.error('Initial database connection failed:', err.message);
});

// ✅ Health check routes
app.get("/", async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    if (mongoose.connection.readyState === 1) {
      dbStatus = 'connected';
    } else {
      // Try to reconnect if disconnected
      await dbConnect();
      dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    }
  } catch (error) {
    console.error('DB check error:', error.message);
  }
  
  res.json({ 
    message: "Krushi Sarjana Backend API", 
    status: "healthy",
    timestamp: new Date().toISOString(),
    dbStatus,
    env: process.env.NODE_ENV || 'development'
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy",
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/retailers", retailerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/orders", orderRoutes);

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route not found", 
    path: req.path,
    method: req.method
  });
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ 
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// ✅ Export for Vercel
export default app;