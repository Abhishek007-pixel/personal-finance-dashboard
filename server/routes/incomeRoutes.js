const express = require('express');
const router = express.Router();
const Income = require('../models/incomeModel');
const authMiddleware = require('../middleware/authMiddleware');

// GET all incomes for the logged-in user
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.userId });
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incomes', error });
  }
});

// PUT route to update income by ID (with user verification)
router.put('/update-income/:id', authMiddleware, async (req, res) => {
  try {
    const updatedIncome = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
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

// POST route to add income
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

// DELETE route to delete income by ID (with user verification)
router.delete('/delete-income/:id', authMiddleware, async (req, res) => {
  try {
    const deletedIncome = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

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
