import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Configure DNS to prefer IPv4
dns.setDefaultResultOrder('ipv4first');

// Validate environment variables
if (!process.env.OPENROUTER_API_KEY) {
  console.error('❌ ERROR: Missing OpenRouter API key in .env file');
  console.log('ℹ️  Get your key from: https://openrouter.ai/keys');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4001;

// Enhanced CORS configuration
app.use(cors({
  origin: [
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`,
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Enhanced chat endpoint with timeout and retry
app.post('/api/chat', async (req, res) => {
  try {
    // Validate request
    if (!req.body?.messages) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Add Indian financial context
    const formattedMessages = req.body.messages.map(msg => ({
      ...msg,
      content: msg.role === 'user' 
        ? `${msg.content}\n\nContext: User is in India. Always use INR (₹) for currency.`
        : msg.content
    }));

    // API call with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": `http://localhost:${PORT}`,
        "X-Title": "Indian Finance Assistant"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528-qwen3-8b",
        messages: formattedMessages,
        temperature: 0.5,
        max_tokens: 1000
      })
    });
    clearTimeout(timeout);

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Format response for Indian context
    if (data.choices?.[0]?.message?.content) {
      data.choices[0].message.content = formatIndianResponse(data.choices[0].message.content);
    }
    console.log('✔ Returning to client:', JSON.stringify(data, null, 2));

    res.json(data);
  } catch (error) {
    console.error('🔥 Backend Error:', error);
    
    const statusCode = error.name === 'AbortError' ? 504 : 500;
    res.status(statusCode).json({ 
      error: 'Failed to process request',
      details: error.message,
      suggestion: statusCode === 504 
        ? 'Request timed out. Please try again.'
        : 'Check your API key and internet connection.'
    });
  }
});

// Format currency and terms for Indian context
function formatIndianResponse(text) {
  return text
    .replace(/\$([0-9,.]+)/g, (_, amount) => {
      const inr = parseFloat(amount.replace(/,/g, '')) * 83.38;
      return `₹${inr.toLocaleString('en-IN')}`;
    })
    .replace(/USD/g, 'INR')
    .replace(/dollar(s)?/gi, 'rupee(s)')
    .replace(/U\.S\./g, 'Indian');
}

// Static files with cache control
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));



// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('⚠️ Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 Using OpenRouter key: ${process.env.OPENROUTER_API_KEY?.slice(0, 8)}...`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, '../public')}\n`);
});
// Serve AI Assistant files
app.use('/ai-assistant', express.static(path.join(__dirname, 'public/ai-assistant')));