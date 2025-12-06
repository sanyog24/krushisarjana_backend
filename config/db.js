import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected Successfully");
    return true;
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    console.error("Please check your MONGODB_URI environment variable in Vercel");
    throw error;
  }
};

export default connectDB;
