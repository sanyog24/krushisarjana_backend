import jwt from "jsonwebtoken";

// **Authentication Middleware**
export const authMiddleware = (req, res, next) => {
  let token = req.cookies.token;

  // ✅ Check Authorization Header if cookie is missing
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1]; // Extract token from "Bearer <token>"
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};



// **Role-Based Access Middleware**
export const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  };
};
