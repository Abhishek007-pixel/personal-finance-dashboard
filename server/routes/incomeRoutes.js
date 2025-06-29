const express = require('express');
const router = express.Router();
const Income = require('../models/incomeModel');
const authMiddleware = require('../middleware/authMiddleware');
// PUT route to update income by ID
router.put('/update-income/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedIncome = await Income.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedIncome) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.status(200).json({ message: 'Income updated successfully', updatedIncome });
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ message: 'Error updating income', error });
  }
});


// POST route to add income (updated)
router.post('/add-income', authMiddleware, async (req, res) => {
    try {
        const { title, amount, date, category, description } = req.body;
        const userId = req.user.userId;

        const newIncome = new Income({ title, amount, date, category, description, userId });
        await newIncome.save();

        res.status(201).json({ message: 'Income added successfully', income: newIncome });
    } catch (error) {
        console.error('Error while adding income:', error);
        res.status(500).json({ message: 'Error adding income', error: error.message });
    }
});

// DELETE route to delete income by ID (keep this)
router.delete('/delete-income/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedIncome = await Income.findByIdAndDelete(id);

        if (!deletedIncome) {
            return res.status(404).json({ message: 'Income not found' });
        }

        res.status(200).json({ message: 'Income deleted successfully', deletedIncome });
    } catch (error) {
        console.error('Error deleting income:', error);
        res.status(500).json({ message: 'Error deleting income', error });
    }
});

module.exports = router;
