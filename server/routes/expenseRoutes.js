const express = require('express');
const router = express.Router();
const Expense = require('../models/expenseModel');

// POST route to add expense
router.post('/add-expense', async (req, res) => {
    try {
        const { title, amount, date, category, description } = req.body;

        const newExpense = new Expense({ title, amount, date, category, description });
        await newExpense.save();

        res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
    } catch (error) {
        console.error('Error while adding expense:', error);
        res.status(500).json({ message: 'Error adding expense', error });
    }
});

// ✅ GET route to get expenses by category (write outside the POST block)
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const expenses = await Expense.find({ category });

        res.status(200).json({
            category,
            expenses
        });
    } catch (error) {
        console.error('Error fetching expenses by category:', error);
        res.status(500).json({ message: 'Error fetching expenses by category', error });
    }
});
// DELETE route to delete expense by ID
router.delete('/delete-expense/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedExpense = await Expense.findByIdAndDelete(id);

        if (!deletedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json({ message: 'Expense deleted successfully', deletedExpense });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Error deleting expense', error });
    }
});
module.exports = router;
