// backend/routes/adminRoutes.js
import express from "express";
import {
  getAdminStats,
  getAllUsers,
  getAllTransactions,
  getChartStats,
  getSuspiciousActivity,
  freezeUser,
  unfreezeUser,
  deleteUser
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { adminProtect } from "../middleware/adminMiddleware.js";

const router = express.Router();

// ADMIN ROUTES
router.get("/stats", authMiddleware, adminProtect, getAdminStats);
router.get("/users", authMiddleware, adminProtect, getAllUsers);
router.get("/transactions", authMiddleware, adminProtect, getAllTransactions);
router.get("/charts", authMiddleware, adminProtect, getChartStats);
router.get("/suspicious", authMiddleware, adminProtect, getSuspiciousActivity);

// USER ACTIONS
router.put("/users/freeze/:id", authMiddleware, adminProtect, freezeUser);
router.put("/users/unfreeze/:id", authMiddleware, adminProtect, unfreezeUser);
router.delete("/users/:id", authMiddleware, adminProtect, deleteUser);

export default router;
