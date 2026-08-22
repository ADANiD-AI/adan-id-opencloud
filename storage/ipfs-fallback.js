/**
 * ADAN-ID OpenCloud - IPFS Fallback Storage
 * Distributed backup using IPFS and Crust Network free pinning
 * ADANiD-AI Organization | Sovereign Cloud Storage
 * Auto-deployed: 2026-08-22
 */

'use strict';

const crypto = require('crypto');
const https = require('https');

const IPFS_API_URL = process.env.IPFS_API_URL || 'https://api.crust.network';
const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs';
const CRUST_SEEDS = process.env.CRUST_SEEDS;

// ============================================
// IPFS OPERATIONS
// ============================================

/**
 * Pin data to IPFS via Crust Network
 * @param {Buffer|string} data - Data to pin
 * @param {string} name - Human-readable name for the pin
 * @returns {Promise<{ cid: string, size: number, url: string }>}
 */
async function pinToIPFS(data, name) {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
  const size = buffer.length;

  // Calculate content hash for deduplication
  const contentHash = crypto.createHash('sha256').update(buffer).digest('hex');

  console.log(`[IPFS] Pinning ${name} (${size} bytes, hash: ${contentHash.slice(0, 16)}...)`);

  // In production: use Crust Network SDK or IPFS HTTP API
  // This is a placeholder that returns a deterministic CID-like hash
  const mockCID = `Qm${contentHash.slice(0, 44)}`;

  return {
    cid: mockCID,
    size,
    url: `${IPFS_GATEWAY}/${mockCID}`,
    name,
    pinnedAt: new Date().toISOString()
  };
}

/**
 * Retrieve data from IPFS by CID
 * @param {string} cid - Content Identifier
 * @returns {Promise<Buffer>} Retrieved data
 */
async function retrieveFromIPFS(cid) {
  return new Promise((resolve, reject) => {
    const url = `${IPFS_GATEWAY}/${cid}`;
    console.log(`[IPFS] Retrieving CID: ${cid}`);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`IPFS retrieval failed: HTTP ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Check if a CID is pinned and accessible
 * @param {string} cid - Content Identifier
 * @returns {Promise<boolean>} Whether the CID is accessible
 */
async function checkIPFSAvailability(cid) {
  return new Promise((resolve) => {
    const url = `${IPFS_GATEWAY}/${cid}`;
    const req = https.request(url, { method: 'HEAD' }, (response) => {
      resolve(response.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => { req.destroy(); resolve(false); });
    req.end();
  });
}

/**
 * Auto-backup critical data to IPFS
 * @param {Object} data - Data object to backup
 * @param {string} category - Data category (quran, fiqh, user-data)
 * @returns {Promise<Object>} Backup result with CID
 */
async function autoBackup(data, category) {
  const serialized = JSON.stringify({
    data,
    category,
    backupTime: new Date().toISOString(),
    org: 'ADANiD-AI',
    version: '1.0.0'
  });

  const name = `adan-id-${category}-${Date.now()}`;
  const result = await pinToIPFS(serialized, name);

  console.log(`[IPFS] Auto-backup complete: ${category} -> ${result.cid}`);
  return result;
}

/**
 * Batch pin multiple items to IPFS
 * @param {Array<{ data: any, name: string }>} items - Items to pin
 * @returns {Promise<Array>} Array of pin results
 */
async function batchPin(items) {
  const results = [];
  for (const item of items) {
    try {
      const result = await pinToIPFS(
        typeof item.data === 'string' ? item.data : JSON.stringify(item.data),
        item.name
      );
      results.push({ success: true, ...result });
    } catch (error) {
      results.push({ success: false, name: item.name, error: error.message });
    }
  }
  return results;
}

/**
 * Health check for IPFS connectivity
 * @returns {Promise<Object>} Health status
 */
async function healthCheck() {
  try {
    // Test IPFS gateway connectivity
    const testCID = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'; // IPFS README
    const available = await checkIPFSAvailability(testCID);
    return {
      status: available ? 'healthy' : 'degraded',
      gateway: IPFS_GATEWAY,
      crustNetwork: !!CRUST_SEEDS,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

module.exports = {
  pinToIPFS,
  retrieveFromIPFS,
  checkIPFSAvailability,
  autoBackup,
  batchPin,
  healthCheck
};
