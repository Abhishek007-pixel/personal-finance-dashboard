const express = require('express');
const router = express.Router();
const Expense = require('../models/expenseModel');
const authMiddleware = require('../middleware/authMiddleware');

// PUT route to update expense by ID
router.put('/update-expense/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json({ message: 'Expense updated successfully', updatedExpense });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Error updating expense', error });
  }
});

// POST route to add expense (updated)
router.post('/add-expense', authMiddleware, async (req, res) => {
    try {
        const { title, amount, date, category, description } = req.body;
        const userId = req.user.userId;

        const newExpense = new Expense({ title, amount, date, category, description, userId });
        await newExpense.save();

        res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
    } catch (error) {
        console.error('Error while adding expense:', error);
        res.status(500).json({ message: 'Error adding expense', error });
    }
});

// ✅ GET route to get expenses by category (keep this)
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

// DELETE route to delete expense by ID (keep this)
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
