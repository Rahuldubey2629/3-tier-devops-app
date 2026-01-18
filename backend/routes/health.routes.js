const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// @desc    Health check endpoint
// @route   GET /health
// @access  Public
router.get('/', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };

  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = error;
    res.status(503).json(healthcheck);
  }
});

// @desc    Readiness check endpoint (for load balancers)
// @route   GET /health/ready
// @access  Public
router.get('/ready', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({
      status: 'ready',
      database: 'connected'
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      database: 'disconnected'
    });
  }
});

// @desc    Liveness check endpoint (for load balancers)
// @route   GET /health/live
// @access  Public
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: Date.now()
  });
});

module.exports = router;
