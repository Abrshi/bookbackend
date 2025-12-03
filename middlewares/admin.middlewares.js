import { log } from "console";
import jwt from "jsonwebtoken";

// Middleware to verify token and check if user is admin
export const verifyAdmin = (req, res, next) => {
  const bearerToken = req.headers?.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  const cookieToken = req.cookies?.accessToken;

  const token = bearerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

