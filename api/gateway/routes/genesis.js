/**
 * ADAN-ID OpenCloud - Genesis Core Routes
 * API routes for Genesis Core integration
 * ADANiD-AI Organization | Sovereign Cloud API
 * Auto-deployed: 2026-08-22
 */

'use strict';

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorize, zeroTrustStack } = require('../../../security/zero-trust-middleware');

// Apply zero-trust middleware to all Genesis routes
router.use(zeroTrustStack);

/**
 * GET /api/v1/genesis/status
 * Get Genesis Core system status
 */
router.get('/status', authenticateJWT, (req, res) => {
  res.json({
    service: 'genesis-core',
    status: 'operational',
    version: '1.0.0',
    organization: 'ADANiD-AI',
    timestamp: new Date().toISOString(),
    requestedBy: req.user?.sub
  });
});

/**
 * GET /api/v1/genesis/config
 * Get Genesis Core configuration (admin only)
 */
router.get('/config', authenticateJWT, authorize('admin', 'genesis-admin'), (req, res) => {
  res.json({
    config: {
      storage: 'cloudflare-r2',
      database: 'mongodb-atlas',
      auth: 'firebase-biometric-did',
      encryption: 'aes-256-gcm',
      entropy: 'quranic-abjad',
      monitoring: 'prometheus-grafana'
    },
    retrievedBy: req.user?.sub,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/v1/genesis/deploy
 * Trigger Genesis Core deployment (admin only)
 */
router.post('/deploy', authenticateJWT, authorize('admin'), async (req, res) => {
  try {
    const { service, version, environment } = req.body;

    if (!service || !version) {
      return res.status(400).json({ error: 'Missing required fields: service, version' });
    }

    // Log deployment request
    console.log(`[Genesis] Deployment requested: ${service}@${version} to ${environment || 'production'} by ${req.user?.sub}`);

    res.json({
      success: true,
      deployment: {
        service,
        version,
        environment: environment || 'production',
        deployedBy: req.user?.sub,
        timestamp: new Date().toISOString(),
        status: 'queued'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Deployment failed', message: error.message });
  }
});

/**
 * GET /api/v1/genesis/services
 * List all Genesis Core services
 */
router.get('/services', authenticateJWT, (req, res) => {
  res.json({
    services: [
      { name: 'api-gateway', port: 3000, status: 'running' },
      { name: 'auth-service', port: 4000, status: 'running' },
      { name: 'storage-service', port: 5000, status: 'running' },
      { name: 'prometheus', port: 9090, status: 'running' },
      { name: 'grafana', port: 3002, status: 'running' },
      { name: 'nginx', port: 443, status: 'running' }
    ],
    totalServices: 6,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/v1/genesis/health
 * Genesis Core health check
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'genesis-core',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
