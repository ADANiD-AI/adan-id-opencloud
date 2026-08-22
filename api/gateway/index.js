/**
 * ADAN-ID OpenCloud - API Gateway
 * Unified REST API for Genesis Core, QuranLab, and MobiVerse
 * ADANiD-AI Organization | Sovereign Cloud API
 * Auto-deployed: 2026-08-22
 */

'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { register: prometheusRegister } = require('prom-client');

// Route handlers
const genesisRoutes = require('./routes/genesis');
const quranLabRoutes = require('./routes/quranlab');
const mobiVerseRoutes = require('./routes/mobiverse');
const githubWebhook = require('../webhooks/github');
const firebaseWebhook = require('../webhooks/firebase');

const app = express();
const API_PORT = parseInt(process.env.API_PORT) || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://quranlab.app', 'https://clarityvault.app', 'https://mobiverse.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-ADAN-Signature', 'X-ADAN-Timestamp'],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[Gateway] ${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'adan-id-api-gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheusRegister.contentType);
  res.end(await prometheusRegister.metrics());
});

// API routes
app.use('/api/v1/genesis', genesisRoutes);
app.use('/api/v1/quranlab', quranLabRoutes);
app.use('/api/v1/mobiverse', mobiVerseRoutes);

// Webhook routes
app.use('/webhooks/github', githubWebhook);
app.use('/webhooks/firebase', firebaseWebhook);

// API info endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'ADAN-ID OpenCloud API',
    version: '1.0.0',
    organization: 'ADANiD-AI',
    endpoints: {
      genesis: '/api/v1/genesis',
      quranlab: '/api/v1/quranlab',
      mobiverse: '/api/v1/mobiverse'
    },
    documentation: 'https://github.com/ADANiD-AI/adan-id-opencloud/blob/main/docs/CLOUD_ARCHITECTURE.md',
    security: 'AES-256-GCM + Quranic Abjad Entropy + Zero-Trust'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: ['/health', '/api/v1', '/api/v1/genesis', '/api/v1/quranlab', '/api/v1/mobiverse']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Gateway] Error:', err.message);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(API_PORT, () => {
  console.log(`[Gateway] ADAN-ID API Gateway running on port ${API_PORT}`);
  console.log(`[Gateway] Organization: ADANiD-AI`);
  console.log(`[Gateway] Security: AES-256-GCM + Abjad Entropy + Zero-Trust`);
  console.log(`[Gateway] Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
