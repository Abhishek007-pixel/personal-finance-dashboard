const express = require('express');
const router = express.Router();
const Income = require('../models/incomeModel');
const Expense = require('../models/expenseModel');

// GET route to get summary
router.get('/', async (req, res) => {
    try {
        const incomes = await Income.find({});
        const expenses = await Expense.find({});

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
