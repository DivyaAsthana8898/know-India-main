/**
 * SECURITY: HTML Sanitization Utility
 * Prevents Stored XSS attacks by sanitizing all user-generated content
 * Uses sanitize-html library with strict settings
 */

const sanitizeHtml = require('sanitize-html');

/**
 * SECURITY: Strict sanitization options - no HTML allowed
 * This is the safest option for user-generated text content
 */
const STRICT_OPTIONS = {
  allowedTags: [],           // No HTML tags allowed
  allowedAttributes: {},     // No attributes allowed
  disallowedTagsMode: 'recursiveEscape',  // Escape rather than remove
};

/**
 * SECURITY: Basic sanitization - allows minimal safe formatting
 * Use only when basic formatting is needed (e.g., descriptions)
 */
const BASIC_OPTIONS = {
  allowedTags: ['b', 'i', 'em', 'strong', 'br'],
  allowedAttributes: {},
  disallowedTagsMode: 'recursiveEscape',
};

/**
 * Sanitize user input to prevent XSS attacks
 * SECURITY: Strips ALL HTML tags and scripts
 * @param {string} input - User input to sanitize
 * @param {number} maxLength - Maximum allowed length (default 10000)
 * @returns {string} Sanitized string
 */
function sanitizeUserInput(input, maxLength = 10000) {
  if (input === null || input === undefined) {
    return '';
  }
  
  if (typeof input !== 'string') {
    return '';
  }
  
  // SECURITY: First sanitize HTML, then trim and limit length
  const sanitized = sanitizeHtml(input, STRICT_OPTIONS);
  return sanitized.trim().substring(0, maxLength);
}

/**
 * Sanitize content that allows basic formatting
 * SECURITY: Only allows safe inline formatting tags
 * @param {string} input - Content to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
function sanitizeContent(input, maxLength = 10000) {
  if (input === null || input === undefined) {
    return '';
  }
  
  if (typeof input !== 'string') {
    return '';
  }
  
  const sanitized = sanitizeHtml(input, BASIC_OPTIONS);
  return sanitized.trim().substring(0, maxLength);
}

/**
 * Sanitize a plain text field (name, title, etc.)
 * SECURITY: Strips ALL HTML, entities, and special characters
 * @param {string} input - Text to sanitize
 * @param {number} maxLength - Maximum allowed length (default 255)
 * @returns {string} Sanitized text
 */
function sanitizeText(input, maxLength = 255) {
  if (input === null || input === undefined) {
    return '';
  }
  
  if (typeof input !== 'string') {
    return '';
  }
  
  // SECURITY: Strip all HTML and decode entities
  const sanitized = sanitizeHtml(input, STRICT_OPTIONS);
  
  // Remove any remaining HTML entities
  const decoded = sanitized
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ');
  
  return decoded.trim().substring(0, maxLength);
}

/**
 * Sanitize URL - validates and sanitizes URL input
 * SECURITY: Only allows http/https URLs, rejects javascript: and data: URLs
 * @param {string} url - URL to sanitize
 * @returns {string|null} Sanitized URL or null if invalid
 */
function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  const trimmed = url.trim();
  
  // SECURITY: Only allow http/https protocols
  if (!trimmed.match(/^https?:\/\//i)) {
    // Allow data:image URLs for inline images
    if (trimmed.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/i)) {
      return trimmed.substring(0, 2000000); // Limit base64 size
    }
    return null;
  }
  
  // SECURITY: Block javascript: and other dangerous protocols
  if (trimmed.match(/^(javascript|data|vbscript|file):/i)) {
    return null;
  }
  
  // Sanitize any HTML in the URL
  return sanitizeHtml(trimmed, STRICT_OPTIONS).substring(0, 2000);
}

module.exports = {
  sanitizeUserInput,
  sanitizeContent,
  sanitizeText,
  sanitizeUrl,
  STRICT_OPTIONS,
  BASIC_OPTIONS,
};
