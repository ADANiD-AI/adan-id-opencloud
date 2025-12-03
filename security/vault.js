/**
 * AES-256 Vault Module
 * Client-side key management system
 * Ensures keys are never stored in the cloud, only on user devices
 */

const crypto = require('crypto');
const { createAbjadSeed } = require('./abjad-entropy');

class AdanVault {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.tagLength = 16; // 128 bits
    this.saltLength = 32; // 256 bits
    this.iterations = 100000; // PBKDF2 iterations
  }

  /**
   * Generate master key from user credentials and Abjad entropy
   * @param {string} userPassword - User's password
   * @param {string} biometricHash - Hash of biometric data
   * @param {Object} options - Key generation options
   * @returns {Promise<Object>} Master key and metadata
   */
  async generateMasterKey(userPassword, biometricHash, options = {}) {
    try {
      // Generate Abjad seed for additional entropy
      const abjadSeed = await createAbjadSeed('vault-master', {
        verseCount: 5,
        includeTimestamp: false // Deterministic for same user
      });

      // Combine user credentials with Abjad entropy
      const combinedInput = Buffer.concat([
        Buffer.from(userPassword, 'utf8'),
        Buffer.from(biometricHash, 'hex'),
        abjadSeed.seed
      ]);

      // Generate salt from Abjad entropy
      const salt = crypto.createHash('sha256')
        .update(abjadSeed.entropy)
        .digest()
        .slice(0, this.saltLength);

      // Derive master key using PBKDF2
      const masterKey = crypto.pbkdf2Sync(
        combinedInput,
        salt,
        this.iterations,
        this.keyLength,
        'sha512'
      );

      // Generate key verification hash
      const verificationHash = crypto.createHash('sha256')
        .update(masterKey)
        .digest('hex');

      return {
        masterKey,
        salt,
        verificationHash,
        abjadValue: abjadSeed.metadata.totalAbjadValue,
        created: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Master key generation failed: ${error.message}`);
    }
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param {Buffer|string} data - Data to encrypt
   * @param {Buffer} key - Encryption key
   * @param {Object} options - Encryption options
   * @returns {Object} Encrypted data with metadata
   */
  encrypt(data, key, options = {}) {
    try {
      const {
        associatedData = null,
        encoding = 'utf8'
      } = options;

      // Convert string data to buffer
      const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, encoding);

      // Generate random IV
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher
      const cipher = crypto.createCipher(this.algorithm, key, iv);

      // Set associated data if provided (for authenticated encryption)
      if (associatedData) {
        cipher.setAAD(Buffer.from(associatedData, 'utf8'));
      }

      // Encrypt data
      let encrypted = cipher.update(dataBuffer);
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      // Get authentication tag
      const authTag = cipher.getAuthTag();

      return {
        encrypted: encrypted.toString('hex'),
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        algorithm: this.algorithm,
        associatedData: associatedData,
        timestamp: Date.now()
      };

    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param {Object} encryptedData - Encrypted data object
   * @param {Buffer} key - Decryption key
   * @param {Object} options - Decryption options
   * @returns {Buffer} Decrypted data
   */
  decrypt(encryptedData, key, options = {}) {
    try {
      const {
        outputEncoding = null
      } = options;

      const {
        encrypted,
        iv,
        authTag,
        associatedData
      } = encryptedData;

      // Create decipher
      const decipher = crypto.createDecipher(
        this.algorithm,
        key,
        Buffer.from(iv, 'hex')
      );

      // Set authentication tag
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));

      // Set associated data if it was used during encryption
      if (associatedData) {
        decipher.setAAD(Buffer.from(associatedData, 'utf8'));
      }

      // Decrypt data
      let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      // Return as requested encoding or buffer
      return outputEncoding ? decrypted.toString(outputEncoding) : decrypted;

    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Create encrypted vault for storing sensitive data
   * @param {Object} data - Data to store in vault
   * @param {Buffer} masterKey - Master encryption key
   * @param {Object} metadata - Vault metadata
   * @returns {Object} Encrypted vault
   */
  createVault(data, masterKey, metadata = {}) {
    try {
      // Prepare vault data
      const vaultData = {
        data,
        metadata: {
          ...metadata,
          created: new Date().toISOString(),
          version: '1.0',
          type: 'adan-vault'
        }
      };

      // Encrypt vault data
      const encryptedVault = this.encrypt(
        JSON.stringify(vaultData),
        masterKey,
        { associatedData: 'adan-vault-data' }
      );

      // Create vault container
      return {
        id: crypto.randomUUID(),
        type: 'adan-vault',
        version: '1.0',
        encrypted: encryptedVault,
        created: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Vault creation failed: ${error.message}`);
    }
  }

  /**
   * Open encrypted vault and retrieve data
   * @param {Object} vault - Encrypted vault
   * @param {Buffer} masterKey - Master decryption key
   * @returns {Object} Decrypted vault data
   */
  openVault(vault, masterKey) {
    try {
      // Decrypt vault data
      const decryptedData = this.decrypt(
        vault.encrypted,
        masterKey,
        { outputEncoding: 'utf8' }
      );

      // Parse vault data
      const vaultData = JSON.parse(decryptedData);

      return {
        data: vaultData.data,
        metadata: vaultData.metadata,
        vaultId: vault.id,
        opened: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Vault opening failed: ${error.message}`);
    }
  }

  /**
   * Generate device-specific encryption key
   * @param {string} deviceId - Unique device identifier
   * @param {Buffer} masterKey - Master key
   * @returns {Buffer} Device-specific key
   */
  generateDeviceKey(deviceId, masterKey) {
    try {
      // Use HKDF to derive device-specific key
      const deviceKey = crypto.hkdfSync(
        'sha256',
        masterKey,
        Buffer.from(deviceId, 'utf8'),
        'adan-device-key',
        this.keyLength
      );

      return deviceKey;

    } catch (error) {
      throw new Error(`Device key generation failed: ${error.message}`);
    }
  }

  /**
   * Secure key storage for client-side persistence
   * @param {Buffer} key - Key to store
   * @param {string} keyId - Key identifier
   * @param {Object} options - Storage options
   * @returns {Object} Encrypted key storage object
   */
  secureKeyStorage(key, keyId, options = {}) {
    try {
      const {
        deviceId = 'default-device',
        expiresIn = 24 * 60 * 60 * 1000 // 24 hours
      } = options;

      // Generate storage encryption key from device info
      const storageKey = crypto.createHash('sha256')
        .update(`${deviceId}-${keyId}-storage`)
        .digest();

      // Encrypt the key for storage
      const encryptedKey = this.encrypt(key, storageKey, {
        associatedData: `key-storage-${keyId}`
      });

      return {
        keyId,
        deviceId,
        encrypted: encryptedKey,
        expiresAt: new Date(Date.now() + expiresIn).toISOString(),
        created: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Secure key storage failed: ${error.message}`);
    }
  }

  /**
   * Retrieve key from secure storage
   * @param {Object} keyStorage - Encrypted key storage object
   * @param {string} deviceId - Device identifier
   * @returns {Buffer} Decrypted key
   */
  retrieveStoredKey(keyStorage, deviceId) {
    try {
      // Check if key has expired
      if (new Date() > new Date(keyStorage.expiresAt)) {
        throw new Error('Stored key has expired');
      }

      // Verify device ID
      if (keyStorage.deviceId !== deviceId) {
        throw new Error('Device ID mismatch');
      }

      // Regenerate storage encryption key
      const storageKey = crypto.createHash('sha256')
        .update(`${deviceId}-${keyStorage.keyId}-storage`)
        .digest();

      // Decrypt the stored key
      const decryptedKey = this.decrypt(keyStorage.encrypted, storageKey);

      return decryptedKey;

    } catch (error) {
      throw new Error(`Key retrieval failed: ${error.message}`);
    }
  }

  /**
   * Generate secure backup codes for key recovery
   * @param {Buffer} masterKey - Master key to backup
   * @param {number} codeCount - Number of backup codes
   * @returns {Array<string>} Backup codes
   */
  generateBackupCodes(masterKey, codeCount = 10) {
    try {
      const backupCodes = [];
      const keyHash = crypto.createHash('sha256').update(masterKey).digest();

      for (let i = 0; i < codeCount; i++) {
        // Generate deterministic but unpredictable backup code
        const codeInput = Buffer.concat([
          keyHash,
          Buffer.from(i.toString(), 'utf8')
        ]);

        const codeHash = crypto.createHash('sha256').update(codeInput).digest('hex');
        const backupCode = codeHash.substring(0, 16).toUpperCase();

        // Format as XXXX-XXXX-XXXX-XXXX
        const formattedCode = backupCode.match(/.{1,4}/g).join('-');
        backupCodes.push(formattedCode);
      }

      return backupCodes;

    } catch (error) {
      throw new Error(`Backup code generation failed: ${error.message}`);
    }
  }

  /**
   * Verify backup code and recover master key
   * @param {string} backupCode - Backup code to verify
   * @param {string} userPassword - User's password
   * @param {string} biometricHash - Biometric hash
   * @returns {Promise<Object>} Recovery result
   */
  async recoverWithBackupCode(backupCode, userPassword, biometricHash) {
    try {
      // Regenerate master key
      const masterKeyData = await this.generateMasterKey(userPassword, biometricHash);
      
      // Generate backup codes for verification
      const generatedCodes = this.generateBackupCodes(masterKeyData.masterKey);
      
      // Normalize backup code format
      const normalizedCode = backupCode.replace(/[^A-F0-9]/g, '').toUpperCase();
      const formattedCode = normalizedCode.match(/.{1,4}/g).join('-');
      
      // Verify backup code
      const isValid = generatedCodes.includes(formattedCode);
      
      if (!isValid) {
        throw new Error('Invalid backup code');
      }
      
      return {
        success: true,
        masterKey: masterKeyData.masterKey,
        verificationHash: masterKeyData.verificationHash,
        recovered: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Securely wipe sensitive data from memory
   * @param {Buffer} buffer - Buffer to wipe
   */
  secureWipe(buffer) {
    if (Buffer.isBuffer(buffer)) {
      // Overwrite with random data multiple times
      for (let i = 0; i < 3; i++) {
        crypto.randomFillSync(buffer);
      }
      // Final overwrite with zeros
      buffer.fill(0);
    }
  }
}

module.exports = AdanVault;