import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// **Register User**
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, role });

  await newUser.save();
  res.status(201).json({ message: "User registered successfully" });
};

// **Login User**
// export const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });
//   if (!user) return res.status(400).json({ message: "Invalid credentials" });

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//   const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

//   res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
//   res.json({ message: "Login successful", token, user });
// };

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  console.log("JWT Token Set in Cookie:", token); // ✅ Debugging log

  res.json({ message: "Login successful", token, user }); // ✅ Send token in response
};



// **Logout User**
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log("Fetching user with ID:", id); // Debug log

    const user = await User.findById(id).select("-password");
    
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // console.log("User data:", user); // Log the fetched user
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
