/**
 * ADAN-ID OpenCloud - OAuth2 Server
 * ADANiD-AI Organization - PRIVATE & CONFIDENTIAL
 * Deployed: Sep 22, 2026
 * Source: ADAN-ID Sovereign Cloud Architect Agent
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { generateAbjadEntropy } = require('../security/abjad-entropy');

const router = express.Router();

// In-memory authorization code store (use Redis in production)
const authCodes = new Map();
const refreshTokens = new Map();

/**
 * Authorization endpoint - issues authorization codes
 * GET /oauth2/authorize?client_id=...&redirect_uri=...&response_type=code&scope=...
 */
router.get('/authorize', (req, res) => {
  const { client_id, redirect_uri, response_type, scope, state } = req.query;

  if (response_type !== 'code') {
    return res.status(400).json({ error: 'unsupported_response_type' });
  }

  // Generate authorization code with Abjad entropy
  const code = crypto.randomBytes(16).toString('hex') + generateAbjadEntropy().slice(0, 8);
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  authCodes.set(code, {
    client_id,
    redirect_uri,
    scope: scope || 'read',
    expiresAt,
    state
  });

  // Redirect with code
  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set('code', code);
  if (state) redirectUrl.searchParams.set('state', state);

  res.redirect(redirectUrl.toString());
});

/**
 * Token endpoint - exchanges code for access token
 * POST /oauth2/token
 */
router.post('/token', (req, res) => {
  const { grant_type, code, redirect_uri, refresh_token, client_id, client_secret } = req.body;

  if (grant_type === 'authorization_code') {
    const authCode = authCodes.get(code);

    if (!authCode || Date.now() > authCode.expiresAt) {
      return res.status(400).json({ error: 'invalid_grant', message: 'Code expired or invalid' });
    }

    if (authCode.redirect_uri !== redirect_uri) {
      return res.status(400).json({ error: 'invalid_grant', message: 'Redirect URI mismatch' });
    }

    authCodes.delete(code);

    const accessToken = jwt.sign(
      { client_id, scope: authCode.scope, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const newRefreshToken = crypto.randomBytes(32).toString('hex');
    refreshTokens.set(newRefreshToken, { client_id, scope: authCode.scope });

    return res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: newRefreshToken,
      scope: authCode.scope
    });
  }

  if (grant_type === 'refresh_token') {
    const tokenData = refreshTokens.get(refresh_token);
    if (!tokenData) {
      return res.status(400).json({ error: 'invalid_grant', message: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign(
      { client_id: tokenData.client_id, scope: tokenData.scope, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: tokenData.scope
    });
  }

  return res.status(400).json({ error: 'unsupported_grant_type' });
});

/**
 * Token introspection endpoint
 * POST /oauth2/introspect
 */
router.post('/introspect', (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ active: true, ...decoded });
  } catch (e) {
    return res.json({ active: false });
  }
});

module.exports = router;
