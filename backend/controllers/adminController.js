// backend/controllers/adminController.js
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

// ------------------------------------------------------------------
// MAIN ADMIN STATS
// ------------------------------------------------------------------
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });

    const totalBalanceAgg = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);
    const totalBalance = totalBalanceAgg[0]?.total || 0;

    const totalTransactions = await Transaction.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysTransfers = await Transaction.countDocuments({
      createdAt: { $gte: today },
      type: "transfer"
    });

    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });

    // example revenue: ₹2 per transaction
    const revenue = totalTransactions * 2;

    res.json({
      totalUsers,
      activeUsers,
      totalBalance,
      totalTransactions,
      todaysTransfers,
      newUsersToday,
      revenue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------------------------------------------------------
// USER MANAGEMENT - LIST USERS (with search + pagination)
// ------------------------------------------------------------------
export const getAllUsers = async (req, res) => {
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
      .select("-password")
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
    res.status(500).json({ error: err.message });
  }
};



// ------------------------------------------------------------------
// ADMIN — Get ALL transactions (this one is used by /api/admin/transactions)
// ------------------------------------------------------------------
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("from", "name email accountNumber")
      .populate("to", "name email accountNumber")
      .sort({ createdAt: -1 });

    res.json(transactions);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------------------------------------------------------
// CHART DATA (for last 7 days)
// ------------------------------------------------------------------
export const getChartStats = async (req, res) => {
  try {
    const last7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const stats = await Transaction.aggregate([
      { $match: { createdAt: { $gte: last7days } } },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------------------------------------------------------
// SUSPICIOUS ACTIVITY (example: amount ≥ 50000)
// ------------------------------------------------------------------
export const getSuspiciousActivity = async (req, res) => {
  try {
    const suspicious = await Transaction.find({ amount: { $gte: 50000 } })
      .sort({ createdAt: -1 });

    // Manually fetch sender/receiver account numbers
    const result = await Promise.all(
      suspicious.map(async (txn) => {
        const sender = await User.findById(txn.from).select("accountNumber");
        const receiver = await User.findById(txn.to).select("accountNumber");

        return {
          _id: txn._id,
          amount: txn.amount,
          createdAt: txn.createdAt,
          senderAccount: sender?.accountNumber || "Unknown",
          receiverAccount: receiver?.accountNumber || "Unknown",
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};//-----------------------------------------------------------------
// USER ACTIONS: FREEZE, UNFREEZE, DELETE
// ------------------------------------------------------------------

export const freezeUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "frozen" },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User frozen", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const unfreezeUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User unfrozen", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

