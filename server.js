const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://trading-tracker-frontend.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Routes
const authRouter = require('./routes/auth.routes');
const accountsRouter = require('./routes/accounts.routes');
const tradesRouter = require('./routes/trades.routes');

app.use('/api/auth', authRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/trades', tradesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server with force sync to recreate tables
sequelize.sync({ force: false, alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to sync database:', error);
  process.exit(1);
});