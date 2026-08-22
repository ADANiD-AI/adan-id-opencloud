/**
 * ADAN-ID OpenCloud - Firebase Storage Adapter
 * Unified adapter for Firebase Auth, Firestore, and Storage
 * ADANiD-AI Organization | Sovereign Cloud Storage
 * Auto-deployed: 2026-08-22
 */

'use strict';

const admin = require('firebase-admin');

let initialized = false;

/**
 * Initialize Firebase Admin SDK
 * @returns {admin.app.App} Firebase app instance
 */
function initializeFirebase() {
  if (initialized) return admin.app();

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  initialized = true;
  console.log('[Firebase] Admin SDK initialized for project:', process.env.FIREBASE_PROJECT_ID);
  return admin.app();
}

/**
 * Get Firestore database instance
 * @returns {admin.firestore.Firestore}
 */
function getFirestore() {
  initializeFirebase();
  return admin.firestore();
}

/**
 * Get Firebase Storage bucket
 * @returns {admin.storage.Storage}
 */
function getStorage() {
  initializeFirebase();
  return admin.storage().bucket();
}

/**
 * Get Firebase Auth instance
 * @returns {admin.auth.Auth}
 */
function getAuth() {
  initializeFirebase();
  return admin.auth();
}

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<admin.auth.DecodedIdToken>}
 */
async function verifyToken(idToken) {
  initializeFirebase();
  return admin.auth().verifyIdToken(idToken);
}

/**
 * Create a new user in Firebase Auth
 * @param {Object} userData - User data
 * @returns {Promise<admin.auth.UserRecord>}
 */
async function createUser(userData) {
  initializeFirebase();
  return admin.auth().createUser(userData);
}

/**
 * Get user by UID
 * @param {string} uid - User ID
 * @returns {Promise<admin.auth.UserRecord>}
 */
async function getUserById(uid) {
  initializeFirebase();
  return admin.auth().getUser(uid);
}

/**
 * Set custom claims for a user (for RBAC)
 * @param {string} uid - User ID
 * @param {Object} claims - Custom claims
 */
async function setUserClaims(uid, claims) {
  initializeFirebase();
  await admin.auth().setCustomUserClaims(uid, claims);
  console.log(`[Firebase] Custom claims set for user ${uid}:`, claims);
}

/**
 * Write document to Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID (null for auto-generated)
 * @param {Object} data - Document data
 * @returns {Promise<string>} Document ID
 */
async function writeDocument(collection, docId, data) {
  const db = getFirestore();
  const docRef = docId ? db.collection(collection).doc(docId) : db.collection(collection).doc();
  await docRef.set({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  return docRef.id;
}

/**
 * Read document from Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @returns {Promise<Object|null>} Document data or null
 */
async function readDocument(collection, docId) {
  const db = getFirestore();
  const doc = await db.collection(collection).doc(docId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

/**
 * Query documents from Firestore
 * @param {string} collection - Collection name
 * @param {Array} filters - Array of [field, operator, value] filters
 * @param {number} limit - Maximum results
 * @returns {Promise<Array>} Array of documents
 */
async function queryDocuments(collection, filters = [], limit = 100) {
  const db = getFirestore();
  let query = db.collection(collection);

  for (const [field, operator, value] of filters) {
    query = query.where(field, operator, value);
  }

  const snapshot = await query.limit(limit).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Delete document from Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 */
async function deleteDocument(collection, docId) {
  const db = getFirestore();
  await db.collection(collection).doc(docId).delete();
  console.log(`[Firebase] Document deleted: ${collection}/${docId}`);
}

/**
 * Upload file to Firebase Storage
 * @param {Buffer} buffer - File buffer
 * @param {string} destination - Storage path
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} Public URL
 */
async function uploadFile(buffer, destination, contentType) {
  const bucket = getStorage();
  const file = bucket.file(destination);

  await file.save(buffer, {
    metadata: { contentType },
    resumable: false
  });

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  console.log(`[Firebase] File uploaded: ${destination}`);
  return url;
}

/**
 * Firebase adapter health check
 * @returns {Promise<Object>} Health status
 */
async function healthCheck() {
  try {
    initializeFirebase();
    const db = getFirestore();
    await db.collection('_health').doc('firebase-adapter').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      service: 'firebase-adapter'
    });
    return {
      status: 'healthy',
      projectId: process.env.FIREBASE_PROJECT_ID,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

module.exports = {
  initializeFirebase,
  getFirestore,
  getStorage,
  getAuth,
  verifyToken,
  createUser,
  getUserById,
  setUserClaims,
  writeDocument,
  readDocument,
  queryDocuments,
  deleteDocument,
  uploadFile,
  healthCheck
};
