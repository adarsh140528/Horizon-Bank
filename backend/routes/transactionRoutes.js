// backend/routes/transactionRoutes.js ✅
import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";
import { getMyTransactions, getAllTransactions } from '../controllers/transactionController.js';

const router = express.Router();

router.get('/my', authMiddleware, getMyTransactions);
router.get('/all', authMiddleware, getAllTransactions);

export default router;
