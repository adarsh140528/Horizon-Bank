// backend/controllers/accountController.js
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

// ---------------- GET BALANCE ----------------
export const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("balance accountNumber");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      balance: user.balance,
      accountNumber: user.accountNumber,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- ADD MONEY (OTP REQUIRED) ----------------
export const addMoney = async (req, res) => {
  try {
    const { amount, otpVerified } = req.body;

    // ✅ Enforce OTP
    if (!otpVerified) {
      return res.status(403).json({ message: "OTP verification required" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.balance += amount;
    await user.save();

    await Transaction.create({
      from: user._id,
      to: user._id,
      amount,
      type: "credit",
      description: "Money added to account",
    });

    res.json({ message: "Money added successfully", balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- TRANSFER MONEY (OTP REQUIRED) ----------------
export const transferMoney = async (req, res) => {
  try {
    const { receiverAccountNumber, amount, otpVerified } = req.body;

    if (!otpVerified) {
      return res.status(403).json({ message: "OTP verification required" });
    }

    if (amount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    const sender = await User.findById(req.user._id);
    if (!sender)
      return res.status(404).json({ message: "Sender not found" });

    // (Optional) Block frozen accounts
    if (sender.status === "frozen") {
      return res.status(403).json({
        message: "Your account is frozen. You cannot perform any transactions.",
      });
    }

    const receiver = await User.findOne({ accountNumber: receiverAccountNumber });
    if (!receiver)
      return res.status(404).json({ message: "Receiver not found" });

    if (sender.balance < amount)
      return res.status(400).json({ message: "Insufficient balance" });

    sender.balance -= amount;
    await sender.save();

    receiver.balance += amount;
    await receiver.save();

    await Transaction.create({
      from: sender._id,
      to: receiver._id,
      amount,
      type: "transfer",
      description: `Transfer to ${receiver.accountNumber}`,
    });

    res.json({ message: "Transfer successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- ADD BENEFICIARY (OTP REQUIRED) ----------------
export const addBeneficiary = async (req, res) => {
  try {
    const { name, beneficiaryAccount, otpVerified } = req.body;

    if (!otpVerified) {
      return res.status(403).json({ message: "OTP verification required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      user.beneficiaries &&
      user.beneficiaries.some((b) => b.accountNumber === beneficiaryAccount)
    ) {
      return res.status(400).json({ message: "Beneficiary already exists" });
    }

    user.beneficiaries = user.beneficiaries || [];
    user.beneficiaries.push({
      name,
      accountNumber: beneficiaryAccount,
    });

    await user.save();

    res.json({ message: "Beneficiary added successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- REMOVE BENEFICIARY ----------------
export const removeBeneficiary = async (req, res) => {
  try {
    const { accountNumber } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.beneficiaries = (user.beneficiaries || []).filter(
      (b) => b.accountNumber !== accountNumber
    );

    await user.save();

    res.json({ message: "Beneficiary removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
