const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chats', require('./routes/chat'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/portfolio', require('./routes/portfolio'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ET AI Concierge Backend is running 🚀' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 ET AI Concierge Backend running on http://localhost:${PORT}`);
});
