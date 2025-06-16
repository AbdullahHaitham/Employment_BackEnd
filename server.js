const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Load environment variables
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

// Debug logging - check if environment variables are loaded
console.log('Environment Variables:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_PUBLISHABLE_KEY:', process.env.STRIPE_PUBLISHABLE_KEY);

connectDB();

const app = express();

// Middleware
app.use(cors());

//  Webhook route must use raw body parser BEFORE express.json
app.use('/api/webhook/stripe', bodyParser.raw({ type: 'application/json' }));

// JSON parser for other routes
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/freelance', require('./routes/freelanceRoutes'));
app.use('/api/proposals', require('./routes/proposalRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/vip', require('./routes/vipRoutes'));
app.use('/api/webhook', require('./routes/webhookRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/cv', require('./routes/cv'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 middleware
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// MongoDB connection error handler
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection at Promise:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// Handle memory leaks
process.on('warning', (warning) => {
  console.warn(warning.name);
  console.warn(warning.message);
  console.warn(warning.stack);
});

// Handle process termination
process.on('exit', (code) => {
  console.log(`Process exited with code ${code}`);
});

// Handle Node.js process events
process.on('beforeExit', (code) => {
  console.log(`Process beforeExit event with code ${code}`);
});