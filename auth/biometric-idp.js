/**
 * Biometric Identity Provider (IDP)
 * Generates Decentralized Identity (DID) from face/fingerprint biometric data
 * Integrates with Abjad entropy for enhanced security
 */

const crypto = require('crypto');
const { generateAbjadEntropy } = require('../security/abjad-entropy');

class BiometricIDP {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
  }

  /**
   * Generate DID from biometric template
   * @param {Buffer} biometricTemplate - Processed biometric data
   * @param {string} biometricType - 'face' or 'fingerprint'
   * @returns {Object} DID document with public key
   */
  async generateDID(biometricTemplate, biometricType) {
    try {
      // Generate Abjad entropy for additional randomness
      const abjadSeed = await generateAbjadEntropy();
      
      // Combine biometric template with Abjad entropy
      const combinedSeed = Buffer.concat([
        biometricTemplate,
        Buffer.from(abjadSeed, 'utf8')
      ]);
      
      // Generate deterministic key pair from biometric data
      const hash = crypto.createHash('sha256').update(combinedSeed).digest();
      const privateKey = crypto.createPrivateKey({
        key: hash,
        format: 'der',
        type: 'sec1'
      });
      
      const publicKey = crypto.createPublicKey(privateKey);
      
      // Create DID identifier
      const publicKeyHash = crypto.createHash('sha256')
        .update(publicKey.export({ format: 'der', type: 'spki' }))
        .digest('hex');
      
      const did = `did:adan:${publicKeyHash.substring(0, 32)}`;
      
      // Create DID document
      const didDocument = {
        '@context': 'https://www.w3.org/ns/did/v1',
        id: did,
        verificationMethod: [{
          id: `${did}#key-1`,
          type: 'EcdsaSecp256k1VerificationKey2019',
          controller: did,
          publicKeyHex: publicKey.export({ format: 'der', type: 'spki' }).toString('hex')
        }],
        authentication: [`${did}#key-1`],
        biometricType: biometricType,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };
      
      return {
        did,
        didDocument,
        privateKey: privateKey.export({ format: 'der', type: 'sec1' }).toString('hex')
      };
      
    } catch (error) {
      throw new Error(`DID generation failed: ${error.message}`);
    }
  }

  /**
   * Verify biometric template against stored DID
   * @param {Buffer} biometricTemplate - Current biometric scan
   * @param {string} storedDID - Previously generated DID
   * @param {string} biometricType - 'face' or 'fingerprint'
   * @returns {boolean} Verification result
   */
  async verifyBiometric(biometricTemplate, storedDID, biometricType) {
    try {
      // Regenerate DID from current biometric
      const { did } = await this.generateDID(biometricTemplate, biometricType);
      
      // Compare with stored DID
      return did === storedDID;
      
    } catch (error) {
      console.error('Biometric verification failed:', error);
      return false;
    }
  }

  /**
   * Extract biometric features (placeholder for actual biometric processing)
   * @param {Buffer} rawBiometricData - Raw biometric scan data
   * @param {string} biometricType - 'face' or 'fingerprint'
   * @returns {Buffer} Processed biometric template
   */
  extractFeatures(rawBiometricData, biometricType) {
    // This is a placeholder - in production, integrate with actual biometric SDKs
    // such as FaceSDK, FingerPrint SDK, or similar
    
    if (biometricType === 'face') {
      // Face feature extraction logic
      return crypto.createHash('sha256').update(rawBiometricData).digest();
    } else if (biometricType === 'fingerprint') {
      // Fingerprint minutiae extraction logic
      return crypto.createHash('sha256').update(rawBiometricData).digest();
    }
    
    throw new Error(`Unsupported biometric type: ${biometricType}`);
  }

  /**
   * Encrypt biometric template for storage
   * @param {Buffer} template - Biometric template
   * @param {string} password - User password for encryption
   * @returns {Object} Encrypted template with IV
   */
  encryptTemplate(template, password) {
    const key = crypto.scryptSync(password, 'adan-salt', this.keyLength);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, key, iv);
    
    let encrypted = cipher.update(template);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return {
      encrypted: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex')
    };
  }

  /**
   * Decrypt biometric template
   * @param {Object} encryptedData - Encrypted template data
   * @param {string} password - User password for decryption
   * @returns {Buffer} Decrypted template
   */
  decryptTemplate(encryptedData, password) {
    const key = crypto.scryptSync(password, 'adan-salt', this.keyLength);
    const decipher = crypto.createDecipher(
      this.algorithm,
      key,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(Buffer.from(encryptedData.encrypted, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted;
  }
}

module.exports = BiometricIDP;