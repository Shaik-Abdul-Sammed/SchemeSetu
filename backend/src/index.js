const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const schemesRouter = require('./routes/v1/schemes');
const calculatorRouter = require('./routes/v1/calculator');
const partnersRouter = require('./routes/v1/partners');
const agentRouter = require('./routes/v1/agent');
const documentsRouter = require('./routes/v1/documents');
const usersRouter = require('./routes/v1/users');
const feedbackRouter = require('./routes/v1/feedback');
const eligibilityRouter = require('./routes/eligibility');
const userRouter = require('./routes/user');

const uliRouter = require('./routes/v1/uliRoutes');
const communityRouter = require('./routes/v1/communityRoutes');
const microloanRouter = require('./routes/v1/microloanRoutes');
const vleRouter = require('./routes/v1/vleRoutes');
const adminRouter = require('./routes/v1/adminRoutes');
const translateRouter = require('./routes/v1/translate');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// CORS configuration for frontend integration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
}
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN.replace(/\/$/, ''));
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.endsWith('.onrender.com')) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-id']
}));

// Body Parsers
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Handler
function healthCheckHandler(req, res) {
  return res.status(200).json({
    status: 'OK',
    service: 'SchemeSetu Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
}

// Health Endpoints
app.get('/api/health', healthCheckHandler);
app.get('/api/v1/health', healthCheckHandler);

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'SchemeSetu Backend API',
    version: '1.0.0',
    description: 'AI-driven government scheme matching platform for marginalized entrepreneurs (SIH 2026)',
    status: 'RUNNING',
    health: '/api/v1/health',
    endpoints: {
      schemes: '/api/v1/schemes',
      recommend: '/api/v1/schemes/recommend',
      eligibilityCheck: '/api/v1/eligibility/check',
      calculator: '/api/v1/calculator/emi',
      partners: '/api/v1/partners',
      nearestPartners: '/api/v1/partners/nearest',
      agent: '/api/v1/agent',
      documents: '/api/v1/documents',
      users: '/api/v1/users',
      auth: '/api/v1/auth',
      userDashboard: '/api/v1/user',
      feedback: '/api/v1/feedback',
      uli: '/api/v1/uli',
      community: '/api/v1/community',
      microloan: '/api/v1/microloan',
      vle: '/api/v1/vle',
      admin: '/api/v1/admin'
    }
  });
});

// API Routes
app.use('/api/v1/schemes', schemesRouter);
app.use('/api/v1/eligibility', eligibilityRouter);
app.use('/api/v1/calculator', calculatorRouter);
app.use('/api/v1/partners', partnersRouter);
app.use('/api/v1/agent', agentRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', usersRouter); // Alias for auth
app.use('/api/v1/user', userRouter);
app.use('/api/v1/feedback', feedbackRouter);
app.use('/api/v1/uli', uliRouter);
app.use('/api/v1/community', communityRouter);
app.use('/api/v1/microloan', microloanRouter);
app.use('/api/v1/vle', vleRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/translate', translateRouter);

// 404 Catch-All Middleware
app.use(notFound);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`🚀 SchemeSetu Backend Server running successfully!`);
    console.log(`📡 URL: http://${HOST}:${PORT}`);
    console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
    console.log(`🩺 V1 Health: http://localhost:${PORT}/api/v1/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;
