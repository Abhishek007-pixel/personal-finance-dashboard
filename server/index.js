// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection URI
const mongoURI = 'mongodb+srv://finance_user:finance123@cluster0.m3cq5qa.mongodb.net/financeDB?retryWrites=true&w=majority';

// MongoDB Connection
mongoose.connect(mongoURI, {
    serverApi: { version: '1', strict: true, deprecationErrors: true }
})
    .then(() => console.log('✅ Connected to MongoDB successfully'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// Import routes
const incomeRoutes = require('./routes/incomeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const summaryRoutes = require('./routes/summaryRoutes');

// Use routes
app.use('/api/income', incomeRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/summary', summaryRoutes);


// Test route
app.get('/', (req, res) => {
    res.send('✅ Node.js server is working and connected to MongoDB!');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
