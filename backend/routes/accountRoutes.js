import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { getBalance, addMoney, transferMoney } from "../controllers/accountController.js";
import { addBeneficiary, removeBeneficiary } from "../controllers/accountController.js";




const router = express.Router();

const isAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }
  next();
};

router.get("/balance", authMiddleware, getBalance);
router.post("/add-money", authMiddleware, addMoney);
router.post("/transfer", authMiddleware, transferMoney);
router.post("/beneficiary/add", authMiddleware, addBeneficiary);
router.post("/beneficiary/remove", authMiddleware, removeBeneficiary);
// GET all users (search + pagination)
router.get("/users", authMiddleware, isAdmin, async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = 10;

    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { accountNumber: { $regex: search, $options: "i" } },
      ],
    };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Freeze user
router.post("/freeze/:id", authMiddleware, isAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "frozen" });
  res.json({ message: "User frozen" });
});

// Unfreeze user
router.post("/unfreeze/:id", authMiddleware, isAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "active" });
  res.json({ message: "User unfrozen" });
});

// Delete user
router.delete("/delete/:id", authMiddleware, isAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

export default router;
