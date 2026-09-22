/**
 * ADAN-ID OpenCloud - DID Generator
 * ADANiD-AI Organization - PRIVATE & CONFIDENTIAL
 * Deployed: Sep 22, 2026
 * Source: ADAN-ID Sovereign Cloud Architect Agent
 *
 * Generates W3C-compatible Decentralized Identifiers (DIDs)
 * using the did:adan method with Quranic Abjad entropy
 */

const crypto = require('crypto');
const { generateAbjadEntropy, calculateAbjadValue } = require('../security/abjad-entropy');

/**
 * Generate a new DID document
 * @param {Object} options - DID generation options
 * @returns {Object} DID document
 */
function generateDID(options = {}) {
  const {
    controller = null,
    purpose = 'authentication',
    metadata = {}
  } = options;

  // Generate unique identifier with Abjad entropy
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const abjadEntropy = generateAbjadEntropy();
  const didId = `did:adan:${randomBytes}_${abjadEntropy.slice(0, 16)}`;

  // Generate key pair for DID
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');

  const publicKeyHex = publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
  const privateKeyHex = privateKey.export({ type: 'pkcs8', format: 'der' }).toString('hex');

  // W3C DID Document
  const didDocument = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1'
    ],
    id: didId,
    controller: controller || didId,
    verificationMethod: [
      {
        id: `${didId}#key-1`,
        type: 'Ed25519VerificationKey2020',
        controller: didId,
        publicKeyMultibase: `z${Buffer.from(publicKeyHex, 'hex').toString('base64')}`
      }
    ],
    authentication: [`${didId}#key-1`],
    assertionMethod: [`${didId}#key-1`],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      ...metadata,
      purpose,
      organization: 'ADANiD-AI',
      abjadSignature: calculateAbjadValue('\u0628\u0633\u0645 \u0627\u0644\u0644\u0647').toString()
    }
  };

  return {
    did: didId,
    document: didDocument,
    privateKey: privateKeyHex, // NEVER store this - return to user only
    publicKey: publicKeyHex
  };
}

/**
 * Resolve a DID to its document
 * @param {string} did - The DID to resolve
 * @param {Map} registry - DID registry
 * @returns {Object|null} DID document or null
 */
function resolveDID(did, registry) {
  if (!did.startsWith('did:adan:')) {
    throw new Error('Invalid DID method. Only did:adan: is supported.');
  }
  return registry.get(did) || null;
}

/**
 * Validate DID format
 * @param {string} did - DID to validate
 * @returns {boolean} True if valid
 */
function validateDID(did) {
  const didPattern = /^did:adan:[a-f0-9]{32}_[a-f0-9]{16}$/;
  return didPattern.test(did);
}

/**
 * Create DID from existing public key
 * @param {string} publicKeyHex - Existing public key
 * @returns {string} DID
 */
function createDIDFromKey(publicKeyHex) {
  const keyHash = crypto.createHash('sha256').update(publicKeyHex).digest('hex');
  const abjadEntropy = generateAbjadEntropy();
  return `did:adan:${keyHash.slice(0, 32)}_${abjadEntropy.slice(0, 16)}`;
}

module.exports = {
  generateDID,
  resolveDID,
  validateDID,
  createDIDFromKey
};
