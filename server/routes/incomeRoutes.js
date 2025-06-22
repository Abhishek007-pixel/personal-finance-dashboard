const express = require('express');
const router = express.Router();
const Income = require('../models/incomeModel');

// POST route to add income
router.post('/add-income', async (req, res) => {
    try {
        console.log(req.body); // 👈 Add this to check if data is coming or not

        const { title, amount, date, category, description } = req.body;

        const newIncome = new Income({ title, amount, date, category, description });
        await newIncome.save();

        res.status(201).json({ message: 'Income added successfully', income: newIncome });
    } catch (error) {
        console.error('Error while adding income:', error);
        res.status(500).json({ message: 'Error adding income', error: error.message });
    }
});
// DELETE route to delete income by ID
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
