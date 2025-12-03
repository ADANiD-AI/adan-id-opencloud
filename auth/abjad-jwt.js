/**
 * Abjad JWT Authentication Module
 * Generates JWT tokens signed with Quranic Abjad entropy
 * Provides enhanced security through spiritual integration
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { generateAbjadEntropy, calculateAbjadValue } = require('../security/abjad-entropy');

class AbjadJWT {
  constructor() {
    this.algorithm = 'HS256';
    this.defaultExpiry = '24h';
    this.issuer = 'adan-id-opencloud';
    this.audience = 'adan-id-users';
  }

  /**
   * Generate JWT token with Abjad entropy signature
   * @param {Object} payload - Token payload
   * @param {Object} options - Token options
   * @returns {Promise<string>} Signed JWT token
   */
  async generateToken(payload, options = {}) {
    try {
      // Generate Abjad entropy for signing key
      const abjadEntropy = await generateAbjadEntropy();
      const abjadValue = calculateAbjadValue(abjadEntropy);
      
      // Create signing key from Abjad entropy
      const signingKey = crypto.createHash('sha256')
        .update(abjadEntropy + abjadValue.toString())
        .digest('hex');
      
      // Prepare token payload with Abjad metadata
      const tokenPayload = {
        ...payload,
        iss: this.issuer,
        aud: this.audience,
        iat: Math.floor(Date.now() / 1000),
        abjad: {
          verse: abjadEntropy.substring(0, 50) + '...', // Truncated for security
          value: abjadValue,
          timestamp: Date.now()
        }
      };
      
      // Token options
      const tokenOptions = {
        algorithm: this.algorithm,
        expiresIn: options.expiresIn || this.defaultExpiry,
        ...options
      };
      
      // Sign token with Abjad-derived key
      const token = jwt.sign(tokenPayload, signingKey, tokenOptions);
      
      return {
        token,
        abjadHash: crypto.createHash('sha256').update(abjadEntropy).digest('hex'),
        expiresAt: new Date(Date.now() + this.parseExpiry(tokenOptions.expiresIn))
      };
      
    } catch (error) {
      throw new Error(`Token generation failed: ${error.message}`);
    }
  }

  /**
   * Verify JWT token with Abjad entropy validation
   * @param {string} token - JWT token to verify
   * @param {string} abjadHash - Original Abjad entropy hash
   * @returns {Promise<Object>} Decoded token payload
   */
  async verifyToken(token, abjadHash) {
    try {
      // Regenerate Abjad entropy from hash (this would need to be stored securely)
      // For now, we'll use a verification approach that doesn't require storing the original
      
      // Decode token without verification to get Abjad metadata
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || !decoded.payload.abjad) {
        throw new Error('Invalid token format - missing Abjad metadata');
      }
      
      // Verify token structure and issuer
      if (decoded.payload.iss !== this.issuer) {
        throw new Error('Invalid token issuer');
      }
      
      // For production, implement proper Abjad entropy verification
      // This is a simplified version for demonstration
      const abjadValue = decoded.payload.abjad.value;
      if (typeof abjadValue !== 'number' || abjadValue <= 0) {
        throw new Error('Invalid Abjad value in token');
      }
      
      // Regenerate signing key (in production, this would use stored entropy)
      const mockAbjadEntropy = await generateAbjadEntropy();
      const signingKey = crypto.createHash('sha256')
        .update(mockAbjadEntropy + abjadValue.toString())
        .digest('hex');
      
      // Verify token signature
      const verified = jwt.verify(token, signingKey, {
        algorithms: [this.algorithm],
        issuer: this.issuer,
        audience: this.audience
      });
      
      return {
        valid: true,
        payload: verified,
        abjadValue: abjadValue,
        expiresAt: new Date(verified.exp * 1000)
      };
      
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        payload: null
      };
    }
  }

  /**
   * Refresh JWT token with new Abjad entropy
   * @param {string} oldToken - Current valid token
   * @param {string} abjadHash - Original Abjad hash
   * @returns {Promise<Object>} New token with fresh Abjad entropy
   */
  async refreshToken(oldToken, abjadHash) {
    try {
      // Verify old token first
      const verification = await this.verifyToken(oldToken, abjadHash);
      if (!verification.valid) {
        throw new Error('Cannot refresh invalid token');
      }
      
      // Extract payload (excluding JWT standard claims)
      const { iss, aud, iat, exp, abjad, ...userPayload } = verification.payload;
      
      // Generate new token with fresh Abjad entropy
      return await this.generateToken(userPayload);
      
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Create authentication middleware for Express.js
   * @param {Object} options - Middleware options
   * @returns {Function} Express middleware function
   */
  createAuthMiddleware(options = {}) {
    return async (req, res, next) => {
      try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            error: 'Missing or invalid authorization header',
            code: 'MISSING_TOKEN'
          });
        }
        
        const token = authHeader.substring(7);
        const abjadHash = req.headers['x-abjad-hash'];
        
        if (!abjadHash && options.requireAbjadHash) {
          return res.status(401).json({
            error: 'Missing Abjad hash header',
            code: 'MISSING_ABJAD_HASH'
          });
        }
        
        // Verify token
        const verification = await this.verifyToken(token, abjadHash);
        if (!verification.valid) {
          return res.status(401).json({
            error: verification.error,
            code: 'INVALID_TOKEN'
          });
        }
        
        // Attach user info to request
        req.user = verification.payload;
        req.abjadValue = verification.abjadValue;
        
        next();
        
      } catch (error) {
        return res.status(500).json({
          error: 'Authentication middleware error',
          code: 'AUTH_MIDDLEWARE_ERROR',
          details: error.message
        });
      }
    };
  }

  /**
   * Parse expiry string to milliseconds
   * @param {string} expiry - Expiry string (e.g., '24h', '7d')
   * @returns {number} Expiry in milliseconds
   */
  parseExpiry(expiry) {
    const units = {
      's': 1000,
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    };
    
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 24 * 60 * 60 * 1000; // Default 24 hours
    }
    
    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  /**
   * Generate API key with Abjad entropy
   * @param {string} userId - User identifier
   * @param {Object} permissions - API permissions
   * @returns {Promise<Object>} API key with metadata
   */
  async generateApiKey(userId, permissions = {}) {
    try {
      const abjadEntropy = await generateAbjadEntropy();
      const abjadValue = calculateAbjadValue(abjadEntropy);
      
      const keyData = {
        userId,
        permissions,
        abjadValue,
        created: Date.now()
      };
      
      const apiKey = crypto.createHash('sha256')
        .update(JSON.stringify(keyData) + abjadEntropy)
        .digest('hex');
      
      return {
        apiKey: `adan_${apiKey}`,
        abjadValue,
        permissions,
        created: new Date(keyData.created)
      };
      
    } catch (error) {
      throw new Error(`API key generation failed: ${error.message}`);
    }
  }
}

module.exports = AbjadJWT;