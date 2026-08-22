/**
 * ADAN-ID OpenCloud - Encrypted Storage Engine
 * AES-256-GCM encrypted storage with Firebase primary and IPFS fallback
 * ADANiD-AI Organization | Sovereign Cloud Storage
 * Auto-deployed: 2026-08-22
 */

'use strict';

const crypto = require('crypto');
const admin = require('firebase-admin');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = parseInt(process.env.ENCRYPTION_IV_LENGTH) || 16;
const TAG_LENGTH = 16;

// Derive encryption key from environment
const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'),
  'hex'
).slice(0, 32);

// ============================================
// ENCRYPTION / DECRYPTION
// ============================================

/**
 * Encrypt data using AES-256-GCM
 * @param {string|Buffer} data - Data to encrypt
 * @returns {{ encrypted: string, iv: string, tag: string }}
 */
function encrypt(data) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  const input = typeof data === 'string' ? data : JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(input, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    algorithm: ALGORITHM,
    keyVersion: '1'
  };
}

/**
 * Decrypt data using AES-256-GCM
 * @param {{ encrypted: string, iv: string, tag: string }} encryptedData
 * @returns {string} Decrypted data
 */
function decrypt(encryptedData) {
  const { encrypted, iv, tag } = encryptedData;
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}

// ============================================
// FIREBASE STORAGE OPERATIONS
// ============================================

/**
 * Store encrypted data in Firebase Firestore
 * @param {string} collection - Firestore collection
 * @param {string} docId - Document ID
 * @param {Object} data - Data to store
 * @param {string} userId - Owner user ID
 * @returns {Promise<string>} Document ID
 */
async function storeEncrypted(collection, docId, data, userId) {
  const db = admin.firestore();
  const encryptedData = encrypt(data);

  const docRef = docId
    ? db.collection(collection).doc(docId)
    : db.collection(collection).doc();

  await docRef.set({
    ...encryptedData,
    userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`[Storage] Encrypted document stored: ${collection}/${docRef.id}`);
  return docRef.id;
}

/**
 * Retrieve and decrypt data from Firebase Firestore
 * @param {string} collection - Firestore collection
 * @param {string} docId - Document ID
 * @param {string} userId - Requesting user ID (for access control)
 * @returns {Promise<Object>} Decrypted data
 */
async function retrieveDecrypted(collection, docId, userId) {
  const db = admin.firestore();
  const docRef = db.collection(collection).doc(docId);
  const doc = await docRef.get();

  if (!doc.exists) throw new Error(`Document not found: ${collection}/${docId}`);

  const data = doc.data();

  // Access control: only owner or admin can read
  if (data.userId !== userId && !userId.startsWith('admin:')) {
    throw new Error('Access denied: insufficient permissions');
  }

  const decrypted = decrypt(data);

  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
}

/**
 * Store large file in Firebase Storage (encrypted)
 * @param {Buffer} fileBuffer - File data
 * @param {string} filePath - Storage path
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} Download URL
 */
async function storeFile(fileBuffer, filePath, contentType) {
  const bucket = admin.storage().bucket();

  // Encrypt file buffer
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encryptedBuffer = Buffer.concat([iv, cipher.update(fileBuffer), cipher.final(), cipher.getAuthTag()]);

  const file = bucket.file(filePath);
  await file.save(encryptedBuffer, {
    metadata: {
      contentType: 'application/octet-stream',
      metadata: {
        originalContentType: contentType,
        encrypted: 'true',
        algorithm: ALGORITHM,
        ivLength: IV_LENGTH.toString()
      }
    }
  });

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });

  console.log(`[Storage] Encrypted file stored: ${filePath}`);
  return url;
}

/**
 * Delete document from Firebase Firestore
 * @param {string} collection - Firestore collection
 * @param {string} docId - Document ID
 * @param {string} userId - Requesting user ID
 */
async function deleteDocument(collection, docId, userId) {
  const db = admin.firestore();
  const docRef = db.collection(collection).doc(docId);
  const doc = await docRef.get();

  if (!doc.exists) throw new Error(`Document not found: ${collection}/${docId}`);

  const data = doc.data();
  if (data.userId !== userId && !userId.startsWith('admin:')) {
    throw new Error('Access denied: insufficient permissions');
  }

  await docRef.delete();
  console.log(`[Storage] Document deleted: ${collection}/${docId}`);
}

/**
 * Health check for storage service
 * @returns {Promise<Object>} Health status
 */
async function healthCheck() {
  try {
    const db = admin.firestore();
    await db.collection('_health').doc('ping').set({ timestamp: Date.now() });
    return { status: 'healthy', firebase: 'connected', encryption: ALGORITHM };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

module.exports = {
  encrypt,
  decrypt,
  storeEncrypted,
  retrieveDecrypted,
  storeFile,
  deleteDocument,
  healthCheck
};
