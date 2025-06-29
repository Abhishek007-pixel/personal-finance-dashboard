// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // 👈 Added this to serve static files

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// 👉 Add this to serve static files from the client folder
//app.use(express.static(path.join(__dirname, '../client')));

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
const userRoutes = require('./routes/userRoutes');

// Use routes
app.use('/api/income', incomeRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/users', userRoutes);


// 👉 Serve index.html as the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
