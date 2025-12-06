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

// ✅ CORS Configuration - Allow production frontend
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://krushi-sarjana.vercel.app'
    ];
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ✅ MongoDB Connection with caching for Vercel (Serverless)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    const state = cached.conn.connection.readyState;
    if (state === 1) {
      return cached.conn;
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      retryReads: true,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB Connected Successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB Connection Error:', error.message);
        cached.promise = null;
        cached.conn = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    console.error('❌ Failed to establish database connection:', e.message);
    throw e;
  }

  return cached.conn;
}

// ✅ Middleware to ensure DB connection before each request
app.use(async (req, res, next) => {
  try {
    await dbConnect();
    next();
  } catch (error) {
    console.error('DB Connection middleware error:', error);
    res.status(503).json({ 
      message: 'Database connection unavailable',
      error: error.message 
    });
  }
});

// ✅ Health check routes
app.get("/", async (req, res) => {
  // Safely check connection state
  const state = mongoose?.connection?.readyState || 0;
  const dbStatus = state === 1 ? 'connected' : state === 2 ? 'connecting' : state === 3 ? 'disconnecting' : 'disconnected';
  
  res.json({ 
    message: "Krushi Sarjana Backend API", 
    status: "healthy",
    timestamp: new Date().toISOString(),
    dbStatus,
    dbState: state,
    env: process.env.NODE_ENV || 'development',
    mongoUriConfigured: !!process.env.MONGODB_URI
  });
});

app.get("/api/health", (req, res) => {
  // Safely check connection state
  const state = mongoose?.connection?.readyState || 0;
  res.json({ 
    status: "healthy",
    database: state === 1 ? 'connected' : 'disconnected',
    dbState: state,
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