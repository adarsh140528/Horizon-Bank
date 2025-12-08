// backend/models/Transaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit', 'transfer'],
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);