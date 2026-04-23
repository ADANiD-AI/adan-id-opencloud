/**
 * ADAN-ID OpenCloud - Zero-Trust Security Middleware
 * ADANiD-AI Organization | Security Module
 * 
 * Implements zero-trust security: verify every request,
 * trust no one, validate everything.
 */

'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Zero-Trust JWT Verification Middleware
 * Validates every incoming request with Abjad-enhanced JWT
 */
function verifyZeroTrust(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'ZERO_TRUST_VIOLATION',
      message: 'No authentication token provided',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    const abjadSeed = process.env.ABJAD_ENTROPY_SEED || 'bismillah_ar_rahman_ar_raheem';
    
    // Combine JWT secret with Abjad entropy for enhanced security
    const enhancedSecret = crypto
      .createHash('sha256')
      .update(`${jwtSecret}:${abjadSeed}`)
      .digest('hex');

    const decoded = jwt.verify(token, enhancedSecret);
    
    // Zero-trust: verify token has required claims
    if (!decoded.did || !decoded.biometricHash) {
      return res.status(403).json({
        error: 'INSUFFICIENT_CLAIMS',
        message: 'Token missing required DID or biometric claims',
        timestamp: new Date().toISOString()
      });
    }

    // Attach verified identity to request
    req.identity = {
      did: decoded.did,
      biometricHash: decoded.biometricHash,
      organization: decoded.org || 'ADANiD-AI',
      issuedAt: decoded.iat,
      expiresAt: decoded.exp
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(403).json({
      error: 'INVALID_TOKEN',
      message: 'Token verification failed',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Rate Limiting Middleware
 * Prevents abuse and DDoS attacks
 */
const requestCounts = new Map();

function rateLimiter(req, res, next) {
  const clientId = req.identity?.did || req.ip;
  const limit = parseInt(process.env.API_RATE_LIMIT) || 100;
  const windowMs = 60 * 1000; // 1 minute window
  const now = Date.now();

  if (!requestCounts.has(clientId)) {
    requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const clientData = requestCounts.get(clientId);
  
  if (now > clientData.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (clientData.count >= limit) {
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Rate limit of ${limit} requests per minute exceeded`,
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
      timestamp: new Date().toISOString()
    });
  }

  clientData.count++;
  next();
}

/**
 * Request Integrity Middleware
 * Validates request signatures for sensitive operations
 */
function validateRequestIntegrity(req, res, next) {
  const signature = req.headers['x-adan-signature'];
  
  if (req.method === 'POST' || req.method === 'PUT') {
    if (!signature) {
      return res.status(400).json({
        error: 'MISSING_SIGNATURE',
        message: 'Request signature required for write operations',
        timestamp: new Date().toISOString()
      });
    }

    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    const body = JSON.stringify(req.body);
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (!crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(`sha256=${expectedSig}`)
    )) {
      return res.status(403).json({
        error: 'INVALID_SIGNATURE',
        message: 'Request signature verification failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  next();
}

/**
 * Security Headers Middleware
 * Adds security headers to all responses
 */
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-ADAN-Cloud', 'ADANiD-AI-Sovereign-Cloud');
  next();
}

module.exports = {
  verifyZeroTrust,
  rateLimiter,
  validateRequestIntegrity,
  securityHeaders
};
