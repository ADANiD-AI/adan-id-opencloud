/**
 * ADAN-ID OpenCloud - GitHub Webhook Handler
 * ADANiD-AI Organization - PRIVATE & CONFIDENTIAL
 * Deployed: Sep 22, 2026
 * Source: ADAN-ID Sovereign Cloud Architect Agent
 */

const express = require('express');
const crypto = require('crypto');
const router = express.Router();

/**
 * Verify GitHub webhook signature
 */
function verifyGitHubSignature(payload, signature) {
  if (!signature) return false;
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}

/**
 * POST /webhooks/github
 * Handle GitHub webhook events
 */
router.post('/', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const event = req.headers['x-github-event'];
  const deliveryId = req.headers['x-github-delivery'];

  // Verify signature
  if (!verifyGitHubSignature(req.body, signature)) {
    console.warn(`[GITHUB-WEBHOOK] Invalid signature for delivery ${deliveryId}`);
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString());
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  console.log(`[GITHUB-WEBHOOK] Event: ${event}, Delivery: ${deliveryId}`);

  // Handle different event types
  switch (event) {
    case 'push': {
      const { ref, repository, commits, pusher } = payload;
      console.log(`[GITHUB-WEBHOOK] Push to ${ref} in ${repository.full_name} by ${pusher.name}`);
      console.log(`[GITHUB-WEBHOOK] ${commits.length} commit(s)`);

      // Only trigger deploy for main branch
      if (ref === 'refs/heads/main') {
        console.log('[GITHUB-WEBHOOK] Main branch push - triggering deployment check');
        // Add deployment logic here
      }
      break;
    }

    case 'pull_request': {
      const { action, pull_request, repository } = payload;
      console.log(`[GITHUB-WEBHOOK] PR ${action}: #${pull_request.number} in ${repository.full_name}`);
      break;
    }

    case 'release': {
      const { action, release, repository } = payload;
      console.log(`[GITHUB-WEBHOOK] Release ${action}: ${release.tag_name} in ${repository.full_name}`);
      break;
    }

    case 'ping': {
      console.log('[GITHUB-WEBHOOK] Ping received - webhook configured successfully');
      break;
    }

    default:
      console.log(`[GITHUB-WEBHOOK] Unhandled event: ${event}`);
  }

  res.json({
    success: true,
    event,
    deliveryId,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
