const express = require('express');
const cors = require('cors');
require('dotenv').config();

const healthRouter = require('../src/routes/health');
const configRouter = require('../src/routes/config');
const consentRouter = require('../src/routes/consent');

// Create Express app without starting the server
const createTestApp = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use(healthRouter);
  app.use(configRouter);
  app.use(consentRouter);

  return app;
};

module.exports = { createTestApp };
