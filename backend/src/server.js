const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const schemesRouter = require('./routes/schemes');
const eligibilityRouter = require('./routes/eligibility');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend clients
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'SchemeSetu API Server',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/api/v1/schemes', schemesRouter);
app.use('/api/v1/eligibility', eligibilityRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Resource not found at ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`SchemeSetu Backend API Server running on port ${PORT}`);
});
