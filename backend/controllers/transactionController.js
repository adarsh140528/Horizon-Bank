// backend/controllers/transactionController.js  ✅ user + all
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({
      $or: [{ from: userId }, { to: userId }],
    })
      .populate('from', 'name email accountNumber')
      .populate('to', 'name email accountNumber')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("from", "name email accountNumber")
      .populate("to", "name email accountNumber")
      .sort({ createdAt: -1 });

    res.json(transactions);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
