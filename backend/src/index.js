const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const healthRouter = require('./routes/health');
const configRouter = require('./routes/config');
const consentRouter = require('./routes/consent');
const scanRouter = require('./routes/scan');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(healthRouter);
app.use(configRouter);
app.use(consentRouter);
app.use(scanRouter);

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    console.log('Note: Run "npm run migrate" to create/update database tables');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
