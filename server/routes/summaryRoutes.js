const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');  // ✅ Fix: import mongoose once at the top
const Income = require('../models/incomeModel');
const Expense = require('../models/expenseModel');
const authMiddleware = require('../middleware/authMiddleware');

// === Main summary endpoint ===
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const incomes = await Income.find({ userId });
    const expenses = await Expense.find({ userId });

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpense;

    const recentTransactions = [
      ...incomes.map(i => ({ ...i.toObject(), type: 'INCOME' })),
      ...expenses.map(e => ({ ...e.toObject(), type: 'EXPENSE' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    console.log('✅ Summary data sending to frontend:', {
      totalIncome, totalExpense, balance, recentTransactions
    });

    res.status(200).json({
      totalIncome,
      totalExpense,
      balance,
      recentTransactions
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
});


// === Chart data endpoint ===
router.get('/chart-data', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Monthly trends: income & expense totals
    const incomeData = await Income.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$date" } },
          total: { $sum: "$amount" }
        }
      }
    ]);

    const expenseData = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$date" } },
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Top 5 expense categories
    const categories = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      monthlyTrends: processMonthlyData(incomeData, expenseData),
      categories: categories.map(c => ({
        name: c._id,
        value: c.total
      }))
    });

  } catch (error) {
    console.error('Error generating chart data:', error);
    res.status(500).json({ message: 'Error generating chart data', error: error.message });
  }
});

// === Helper ===
function processMonthlyData(incomeData, expenseData) {
  const now = new Date();
  const months = [];
  const incomeMap = {};
  const expenseMap = {};

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleString('default', { month: 'short' });
    const key = date.getMonth() + 1; // month number (1–12)
    months.push({ label, key });
  }

  incomeData.forEach(entry => { incomeMap[entry._id.month] = entry.total; });
  expenseData.forEach(entry => { expenseMap[entry._id.month] = entry.total; });

  return {
    labels: months.map(m => m.label),
    income: months.map(m => incomeMap[m.key] || 0),
    expenses: months.map(m => expenseMap[m.key] || 0)
  };
}

module.exports = router;
