import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

// Promisify fs methods
const fsUnlink = promisify(fs.unlink);
const fsExists = promisify(fs.exists);
const fsStat = promisify(fs.stat);

/**
 * Response utility functions
 */
export class ResponseUtils {
  /**
   * Send success response
   * @param {object} res - Express response object
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send error response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {any} details - Additional error details
   */
  static error(res, message = 'Internal Server Error', statusCode = 500, details = null) {
    return res.status(statusCode).json({
      success: false,
      error: message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send paginated response
   * @param {object} res - Express response object
   * @param {Array} data - Response data
   * @param {object} pagination - Pagination info
   * @param {string} message - Success message
   */
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        currentPage: pagination.page,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        totalItems: pagination.total,
        itemsPerPage: pagination.limit,
        hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrevPage: pagination.page > 1
      },
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * File utility functions
 */
export class FileUtils {
  /**
   * Delete file from filesystem
   * @param {string} filePath - Path to the file
   * @returns {Promise<boolean>} Success status
   */
  static async deleteFile(filePath) {
    try {
      const exists = await fsExists(filePath);
      if (exists) {
        await fsUnlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get file info
   * @param {string} filePath - Path to the file
   * @returns {Promise<object|null>} File information
   */
  static async getFileInfo(filePath) {
    try {
      const stats = await fsStat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  /**
   * Format file size
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file extension
   * @param {string} filename - Filename
   * @returns {string} File extension
   */
  static getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }

  /**
   * Ensure directory exists, create if it doesn't
   * @param {string} dirPath - Directory path
   * @returns {Promise<boolean>} Success status
   */
  static async ensureDirectoryExists(dirPath) {
    try {
      await fsPromises.mkdir(dirPath, { recursive: true });
      return true;
    } catch (error) {
      console.error('Error creating directory:', error);
      return false;
    }
  }

  /**
   * Generate unique filename
   * @param {string} originalName - Original filename
   * @returns {string} Unique filename
   */
  static generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    
    return `${name}-${timestamp}-${random}${ext}`;
  }
}

/**
 * String utility functions
 */
export class StringUtils {
  /**
   * Capitalize first letter
   * @param {string} str - Input string
   * @returns {string} Capitalized string
   */
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convert to slug
   * @param {string} str - Input string
   * @returns {string} Slug string
   */
  static toSlug(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  /**
   * Truncate string
   * @param {string} str - Input string
   * @param {number} length - Maximum length
   * @param {string} suffix - Suffix for truncated string
   * @returns {string} Truncated string
   */
  static truncate(str, length = 100, suffix = '...') {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  }

  /**
   * Generate random string
   * @param {number} length - Length of random string
   * @param {string} chars - Characters to use
   * @returns {string} Random string
   */
  static generateRandom(length = 10, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Validation utility functions
 */
export class ValidationUtils {
  /**
   * Check if email is valid
   * @param {string} email - Email address
   * @returns {boolean} Validation result
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if URL is valid
   * @param {string} url - URL string
   * @returns {boolean} Validation result
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if string is empty or whitespace
   * @param {string} str - Input string
   * @returns {boolean} Validation result
   */
  static isEmpty(str) {
    return !str || str.trim().length === 0;
  }

  /**
   * Sanitize HTML string
   * @param {string} str - Input string
   * @returns {string} Sanitized string
   */
  static sanitizeHtml(str) {
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}

/**
 * Date utility functions
 */
export class DateUtils {
  /**
   * Format date to ISO string
   * @param {Date} date - Date object
   * @returns {string} ISO date string
   */
  static toISOString(date = new Date()) {
    return date.toISOString();
  }

  /**
   * Format date to readable string
   * @param {Date} date - Date object
   * @param {string} locale - Locale string
   * @returns {string} Formatted date string
   */
  static toReadableString(date = new Date(), locale = 'en-US') {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get time ago string
   * @param {Date} date - Date object
   * @returns {string} Time ago string
   */
  static timeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  }
}
