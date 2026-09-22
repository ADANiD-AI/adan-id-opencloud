/**
 * ADAN-ID OpenCloud - WebSocket Server
 * ADANiD-AI Organization - PRIVATE & CONFIDENTIAL
 * Deployed: Sep 22, 2026
 * Source: ADAN-ID Sovereign Cloud Architect Agent
 *
 * Real-time WebSocket server for live updates across:
 * - Genesis Core
 * - QuranLab
 * - MobiVerse
 */

const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const WS_PORT = process.env.WS_PORT || 3001;

// Create WebSocket server
const wss = new WebSocket.Server({ port: WS_PORT });

// Track subscriptions: repo -> Set of WebSocket clients
const subscriptions = new Map();

/**
 * Authenticate WebSocket connection via JWT
 */
function authenticateWS(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
}

/**
 * Broadcast message to all subscribers of a repo
 */
function broadcast(repo, message) {
  const clients = subscriptions.get(repo);
  if (!clients) return 0;

  let sent = 0;
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
      sent++;
    }
  }
  return sent;
}

wss.on('connection', (ws, req) => {
  console.log(`[WS] New connection from ${req.socket.remoteAddress}`);

  // Require authentication within 5 seconds
  const authTimeout = setTimeout(() => {
    if (!ws.authenticated) {
      ws.close(4001, 'Authentication timeout');
    }
  }, 5000);

  ws.on('message', (rawMessage) => {
    let data;
    try {
      data = JSON.parse(rawMessage);
    } catch (e) {
      ws.send(JSON.stringify({ error: 'Invalid JSON', code: 'WS_001' }));
      return;
    }

    switch (data.type) {
      case 'auth': {
        const user = authenticateWS(data.token);
        if (!user) {
          ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid token', code: 'WS_002' }));
          ws.close(4002, 'Authentication failed');
          return;
        }
        ws.authenticated = true;
        ws.user = user;
        clearTimeout(authTimeout);
        ws.send(JSON.stringify({ type: 'auth_success', did: user.did }));
        console.log(`[WS] Authenticated: ${user.did}`);
        break;
      }

      case 'subscribe': {
        if (!ws.authenticated) {
          ws.send(JSON.stringify({ error: 'Not authenticated', code: 'WS_003' }));
          return;
        }
        const repo = data.repo;
        if (!['genesis', 'quranlab', 'mobiverse'].includes(repo)) {
          ws.send(JSON.stringify({ error: 'Invalid repo', code: 'WS_004' }));
          return;
        }
        if (!subscriptions.has(repo)) subscriptions.set(repo, new Set());
        subscriptions.get(repo).add(ws);
        ws.subscriptions = ws.subscriptions || new Set();
        ws.subscriptions.add(repo);
        ws.send(JSON.stringify({ type: 'subscribed', repo }));
        console.log(`[WS] ${ws.user.did} subscribed to ${repo}`);
        break;
      }

      case 'unsubscribe': {
        const repo = data.repo;
        if (subscriptions.has(repo)) {
          subscriptions.get(repo).delete(ws);
        }
        ws.send(JSON.stringify({ type: 'unsubscribed', repo }));
        break;
      }

      case 'push_update': {
        if (!ws.authenticated) return;
        const { repo, payload } = data;
        const sent = broadcast(repo, {
          type: 'update',
          repo,
          payload,
          from: ws.user.did,
          timestamp: new Date().toISOString()
        });
        ws.send(JSON.stringify({ type: 'broadcast_sent', repo, recipients: sent }));
        break;
      }

      default:
        ws.send(JSON.stringify({ error: 'Unknown message type', code: 'WS_005' }));
    }
  });

  ws.on('close', () => {
    // Clean up subscriptions
    if (ws.subscriptions) {
      for (const repo of ws.subscriptions) {
        if (subscriptions.has(repo)) {
          subscriptions.get(repo).delete(ws);
        }
      }
    }
    console.log(`[WS] Connection closed`);
  });

  ws.on('error', (err) => {
    console.error(`[WS] Error: ${err.message}`);
  });
});

console.log(`[ADAN-ID] WebSocket server running on port ${WS_PORT}`);

module.exports = { wss, broadcast };
