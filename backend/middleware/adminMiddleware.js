import jwt from "jsonwebtoken";
import User from "../models/User.js";
// backend/middleware/adminMiddleware.js
export const adminProtect = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access denied" });
  }
  next();
};

