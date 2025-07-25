// Load env vars
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// === PORT SETUP ===
const PORTS = {
  main: process.env.PORT || process.env.MAIN_BACKEND_PORT || 5000,
  frontend: process.env.FRONTEND_PORT || 3000,
  ai: process.env.AI_ASSISTANT_PORT || 4001,
  video: process.env.VIDEO_PORT || 4002
};

// === Initialize app ===
const app = express();

// === Enhanced dynamic CORS ===
const allowedOrigins = [
  process.env.FRONTEND_URL,
  `http://localhost:${PORTS.frontend}`,
  `http://127.0.0.1:${PORTS.frontend}`,
  `http://localhost:${PORTS.main}`,
  `http://localhost:${PORTS.ai}`,
  `http://localhost:${PORTS.video}`,
  `http://127.0.0.1:8080`,
  `http://localhost:8080`,
  `http://localhost:5500` // live-server
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight
app.options('*', cors());

// === Middlewares ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Logger middleware ===
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} from ${req.ip} (origin: ${req.headers.origin})`);
  next();
});

// === Static files ===
app.use(express.static(path.join(__dirname, '../public')));
app.use('/ai-assistant', express.static(path.join(__dirname, '../public/ai-assistant')));

// === MongoDB connect ===
const mongoURI = process.env.MONGODB_URI || 
  'mongodb+srv://finance_user:Data%409874@cluster0.m3cq5qa.mongodb.net/financeDB?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  }
};
connectDB();

// === Routes ===
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/income', require('./routes/incomeRoutes'));
app.use('/api/expense', require('./routes/expenseRoutes'));
app.use('/api/summary', require('./routes/summaryRoutes'));

// === Health check ===
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    dbState: mongoose.connection.readyState,
    ports: PORTS,
    allowedOrigins
  });
});

// === Start server ===
const server = app.listen(PORTS.main, () => {
  console.log(`
  ===================================
  🚀 Finance Dashboard Server Running
  ===================================
  Main API:     http://localhost:${PORTS.main}
  Frontend:     http://localhost:${PORTS.frontend}
  AI Assistant: http://localhost:${PORTS.ai}
  Video:        http://localhost:${PORTS.video}
  ===================================
  `);
  console.log('Allowed CORS origins:', allowedOrigins);
});

// === Error handling ===
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORTS.main} is already in use`);
    console.log('Tip: change PORT in .env or kill the process');
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('⚠️ Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});
