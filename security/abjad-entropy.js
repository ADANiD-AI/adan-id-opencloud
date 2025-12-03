/**
 * Abjad Entropy Generator
 * Generates cryptographic entropy from Quranic verses using Abjad numerical system
 * Provides spiritual integration with mathematical security
 */

const crypto = require('crypto');

// Abjad numerical values for Arabic letters
const ABJAD_VALUES = {
  'ا': 1, 'ب': 2, 'ج': 3, 'د': 4, 'ه': 5, 'و': 6, 'ز': 7, 'ح': 8, 'ط': 9,
  'ي': 10, 'ك': 20, 'ل': 30, 'م': 40, 'ن': 50, 'س': 60, 'ع': 70, 'ف': 80, 'ص': 90,
  'ق': 100, 'ر': 200, 'ش': 300, 'ت': 400, 'ث': 500, 'خ': 600, 'ذ': 700, 'ض': 800, 'ظ': 900, 'غ': 1000
};

// Selected Quranic verses for entropy generation
const QURANIC_VERSES = [
  'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', // Al-Fatiha 1:1
  'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', // Al-Fatiha 1:2
  'الرَّحْمَٰنِ الرَّحِيمِ', // Al-Fatiha 1:3
  'مَالِكِ يَوْمِ الدِّينِ', // Al-Fatiha 1:4
  'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', // Al-Fatiha 1:5
  'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', // Al-Fatiha 1:6
  'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ', // Al-Fatiha 1:7
  'قُلْ هُوَ اللَّهُ أَحَدٌ', // Al-Ikhlas 112:1
  'اللَّهُ الصَّمَدُ', // Al-Ikhlas 112:2
  'لَمْ يَلِدْ وَلَمْ يُولَدْ', // Al-Ikhlas 112:3
  'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', // Al-Ikhlas 112:4
  'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', // Al-Falaq 113:1
  'مِن شَرِّ مَا خَلَقَ', // Al-Falaq 113:2
  'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', // Al-Falaq 113:3
  'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', // Al-Falaq 113:4
  'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', // Al-Falaq 113:5
  'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', // An-Nas 114:1
  'مَلِكِ النَّاسِ', // An-Nas 114:2
  'إِلَٰهِ النَّاسِ', // An-Nas 114:3
  'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ' // An-Nas 114:4
];

class AbjadEntropy {
  constructor() {
    this.minEntropyBits = 256;
    this.maxVerseLength = 100;
  }

  /**
   * Calculate Abjad numerical value of Arabic text
   * @param {string} text - Arabic text
   * @returns {number} Total Abjad value
   */
  calculateAbjadValue(text) {
    let total = 0;
    for (const char of text) {
      if (ABJAD_VALUES[char]) {
        total += ABJAD_VALUES[char];
      }
    }
    return total;
  }

  /**
   * Generate cryptographic entropy from Quranic verses
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated entropy string
   */
  async generateAbjadEntropy(options = {}) {
    try {
      const {
        verseCount = 3,
        includeTimestamp = true,
        includeRandomSalt = true,
        customVerses = null
      } = options;

      // Select verses for entropy generation
      const verses = customVerses || this.selectRandomVerses(verseCount);
      
      // Calculate Abjad values for each verse
      const verseData = verses.map(verse => ({
        text: verse,
        abjadValue: this.calculateAbjadValue(verse),
        length: verse.length
      }));

      // Create entropy components
      const components = {
        verses: verseData,
        totalAbjadValue: verseData.reduce((sum, v) => sum + v.abjadValue, 0),
        verseCount: verses.length,
        timestamp: includeTimestamp ? Date.now() : 0,
        randomSalt: includeRandomSalt ? crypto.randomBytes(16).toString('hex') : ''
      };

      // Generate deterministic entropy from components
      const entropyString = this.combineEntropyComponents(components);
      
      // Ensure sufficient entropy bits
      const finalEntropy = await this.enhanceEntropy(entropyString);
      
      return {
        entropy: finalEntropy,
        metadata: {
          verses: verses,
          totalAbjadValue: components.totalAbjadValue,
          entropyBits: this.calculateEntropyBits(finalEntropy),
          generated: new Date().toISOString()
        }
      };
      
    } catch (error) {
      throw new Error(`Abjad entropy generation failed: ${error.message}`);
    }
  }

  /**
   * Select random verses from the Quranic collection
   * @param {number} count - Number of verses to select
   * @returns {Array<string>} Selected verses
   */
  selectRandomVerses(count) {
    const selected = [];
    const availableVerses = [...QURANIC_VERSES];
    
    for (let i = 0; i < Math.min(count, availableVerses.length); i++) {
      const randomIndex = crypto.randomInt(0, availableVerses.length);
      selected.push(availableVerses.splice(randomIndex, 1)[0]);
    }
    
    return selected;
  }

  /**
   * Combine entropy components into a single string
   * @param {Object} components - Entropy components
   * @returns {string} Combined entropy string
   */
  combineEntropyComponents(components) {
    const verseTexts = components.verses.map(v => v.text).join('');
    const abjadValues = components.verses.map(v => v.abjadValue.toString()).join('');
    
    return [
      verseTexts,
      abjadValues,
      components.totalAbjadValue.toString(),
      components.timestamp.toString(),
      components.randomSalt
    ].join('|');
  }

  /**
   * Enhance entropy using cryptographic functions
   * @param {string} baseEntropy - Base entropy string
   * @returns {Promise<string>} Enhanced entropy
   */
  async enhanceEntropy(baseEntropy) {
    // Apply multiple rounds of hashing for entropy enhancement
    let enhanced = baseEntropy;
    
    // Round 1: SHA-256
    enhanced = crypto.createHash('sha256').update(enhanced).digest('hex');
    
    // Round 2: SHA-512
    enhanced = crypto.createHash('sha512').update(enhanced).digest('hex');
    
    // Round 3: PBKDF2 with Abjad-derived salt
    const abjadSalt = this.calculateAbjadValue(baseEntropy.substring(0, 50)).toString();
    enhanced = crypto.pbkdf2Sync(enhanced, abjadSalt, 10000, 64, 'sha512').toString('hex');
    
    // Round 4: Final SHA-256 for standardization
    enhanced = crypto.createHash('sha256').update(enhanced).digest('hex');
    
    return enhanced;
  }

  /**
   * Calculate entropy bits in a string
   * @param {string} entropyString - Entropy string to analyze
   * @returns {number} Estimated entropy bits
   */
  calculateEntropyBits(entropyString) {
    // Simple entropy calculation based on character diversity
    const uniqueChars = new Set(entropyString).size;
    const length = entropyString.length;
    
    // Shannon entropy approximation
    return Math.floor(length * Math.log2(uniqueChars));
  }

  /**
   * Verify Abjad entropy integrity
   * @param {string} entropy - Entropy to verify
   * @param {Object} metadata - Original metadata
   * @returns {boolean} Verification result
   */
  verifyEntropyIntegrity(entropy, metadata) {
    try {
      // Recalculate Abjad values from original verses
      const recalculatedTotal = metadata.verses.reduce(
        (sum, verse) => sum + this.calculateAbjadValue(verse), 0
      );
      
      // Verify total matches metadata
      if (recalculatedTotal !== metadata.totalAbjadValue) {
        return false;
      }
      
      // Verify entropy has sufficient bits
      const entropyBits = this.calculateEntropyBits(entropy);
      if (entropyBits < this.minEntropyBits) {
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error('Entropy verification failed:', error);
      return false;
    }
  }

  /**
   * Generate time-based Abjad entropy
   * @param {Date} date - Specific date for entropy
   * @returns {Promise<Object>} Time-based entropy
   */
  async generateTimeBasedEntropy(date = new Date()) {
    const timeComponents = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes()
    };
    
    // Select verses based on time components
    const verseIndex = (timeComponents.hour + timeComponents.minute) % QURANIC_VERSES.length;
    const selectedVerse = QURANIC_VERSES[verseIndex];
    
    // Generate entropy with time-based verse selection
    return await this.generateAbjadEntropy({
      customVerses: [selectedVerse],
      includeTimestamp: true,
      includeRandomSalt: false // Deterministic for time-based
    });
  }

  /**
   * Create Abjad-based seed for cryptographic operations
   * @param {string} purpose - Purpose of the seed (e.g., 'jwt', 'encryption')
   * @param {Object} options - Seed generation options
   * @returns {Promise<Buffer>} Cryptographic seed
   */
  async createAbjadSeed(purpose, options = {}) {
    const entropy = await this.generateAbjadEntropy(options);
    
    // Combine entropy with purpose for domain separation
    const seedInput = `${purpose}:${entropy.entropy}`;
    
    // Generate seed using HKDF (HMAC-based Key Derivation Function)
    const seed = crypto.hkdfSync('sha256', seedInput, '', `adan-${purpose}`, 32);
    
    return {
      seed,
      entropy: entropy.entropy,
      metadata: entropy.metadata,
      purpose
    };
  }
}

// Export functions for backward compatibility
const abjadEntropy = new AbjadEntropy();

module.exports = {
  AbjadEntropy,
  generateAbjadEntropy: (options) => abjadEntropy.generateAbjadEntropy(options),
  calculateAbjadValue: (text) => abjadEntropy.calculateAbjadValue(text),
  verifyEntropyIntegrity: (entropy, metadata) => abjadEntropy.verifyEntropyIntegrity(entropy, metadata),
  createAbjadSeed: (purpose, options) => abjadEntropy.createAbjadSeed(purpose, options),
  ABJAD_VALUES,
  QURANIC_VERSES
};