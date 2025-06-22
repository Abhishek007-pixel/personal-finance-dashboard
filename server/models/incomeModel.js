const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    description: { type: String }
});

module.exports = mongoose.model('Income', incomeSchema);
