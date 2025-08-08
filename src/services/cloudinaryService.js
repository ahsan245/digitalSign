import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class CloudinaryService {
  /**
   * Upload image to Cloudinary
   * @param {string} filePath - Path to the file
   * @param {object} options - Upload options
   * @returns {Promise<object>} Upload result
   */
  static async uploadImage(filePath, options = {}) {
    try {
      const defaultOptions = {
        folder: 'uploads',
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto'
      };

      const uploadOptions = { ...defaultOptions, ...options };
      
      const result = await cloudinary.uploader.upload(filePath, uploadOptions);
      
      return {
        success: true,
        data: {
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          resource_type: result.resource_type,
          created_at: result.created_at
        }
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload video to Cloudinary
   * @param {string} filePath - Path to the file
   * @param {object} options - Upload options
   * @returns {Promise<object>} Upload result
   */
  static async uploadVideo(filePath, options = {}) {
    try {
      const defaultOptions = {
        folder: 'videos',
        resource_type: 'video',
        quality: 'auto'
      };

      const uploadOptions = { ...defaultOptions, ...options };
      
      const result = await cloudinary.uploader.upload(filePath, uploadOptions);
      
      return {
        success: true,
        data: {
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          resource_type: result.resource_type,
          duration: result.duration,
          created_at: result.created_at
        }
      };
    } catch (error) {
      console.error('Cloudinary video upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete resource from Cloudinary
   * @param {string} publicId - Public ID of the resource
   * @param {string} resourceType - Type of resource (image, video, raw)
   * @returns {Promise<object>} Delete result
   */
  static async deleteResource(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      
      return {
        success: result.result === 'ok',
        data: result
      };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get optimized URL for an image
   * @param {string} publicId - Public ID of the image
   * @param {object} transformations - Image transformations
   * @returns {string} Optimized URL
   */
  static getOptimizedUrl(publicId, transformations = {}) {
    const defaultTransformations = {
      quality: 'auto',
      fetch_format: 'auto'
    };

    const finalTransformations = { ...defaultTransformations, ...transformations };
    
    return cloudinary.url(publicId, finalTransformations);
  }

  /**
   * Generate image variants (thumbnails, different sizes)
   * @param {string} publicId - Public ID of the image
   * @returns {object} Various image URLs
   */
  static generateImageVariants(publicId) {
    return {
      thumbnail: this.getOptimizedUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
      small: this.getOptimizedUrl(publicId, { width: 300, height: 300, crop: 'fit' }),
      medium: this.getOptimizedUrl(publicId, { width: 600, height: 600, crop: 'fit' }),
      large: this.getOptimizedUrl(publicId, { width: 1200, height: 1200, crop: 'fit' }),
      original: this.getOptimizedUrl(publicId)
    };
  }

  /**
   * Upload multiple files
   * @param {Array} files - Array of file paths
   * @param {object} options - Upload options
   * @returns {Promise<Array>} Array of upload results
   */
  static async uploadMultiple(files, options = {}) {
    try {
      const uploadPromises = files.map(file => {
        const fileType = file.mimetype?.startsWith('video/') ? 'video' : 'image';
        return fileType === 'video' 
          ? this.uploadVideo(file.path, options)
          : this.uploadImage(file.path, options);
      });

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Multiple upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default CloudinaryService;
