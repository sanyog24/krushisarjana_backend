import jwt from "jsonwebtoken";

// **Authentication Middleware**
export const authMiddleware = (req, res, next) => {
  let token = req.cookies.token;

  // ✅ Check Authorization Header if cookie is missing
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1]; // Extract token from "Bearer <token>"
  }

  if (!token) {
    console.error("[authMiddleware] No token found in cookies or headers");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("[authMiddleware] User authenticated:", decoded.id, decoded.role);
    next();
  } catch (error) {
    console.error("[authMiddleware] Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};



// **Role-Based Access Middleware**
export const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      console.error("[roleMiddleware] Access denied for role:", req.user?.role);
      return res.status(403).json({ message: "Access Denied: Insufficient permissions" });
    }
    console.log("[roleMiddleware] Access granted for role:", req.user.role);
    next();
  };
};
