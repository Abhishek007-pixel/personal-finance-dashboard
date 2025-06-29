const express = require('express');
const router = express.Router();
const Income = require('../models/incomeModel');
const Expense = require('../models/expenseModel');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

        const incomes = await Income.find({ userId });
        const expenses = await Expense.find({ userId });

        const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
        const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
        const balance = totalIncome - totalExpense;

        res.status(200).json({
            totalIncome,
            totalExpense,
            balance,
            incomes,
            expenses
        });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ message: 'Error fetching summary', error });
    }
});

module.exports = router;
