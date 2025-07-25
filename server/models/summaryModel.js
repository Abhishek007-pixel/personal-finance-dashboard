const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalIncome: { type: Number, default: 0 },
  totalExpense: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  categories: [{
    name: String,
    value: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Summary', summarySchema);