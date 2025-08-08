import CloudinaryService from '../services/cloudinaryService.js';
import { TemplateService } from '../services/templateService.js';
import { ImageProcessingService } from '../services/imageProcessingService.js';
import { ResponseUtils, FileUtils } from '../utils/helpers.js';
import prisma from '../services/prismaService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class UploadController {
  /**
   * Upload single file with template processing
   */
  static async uploadSingle(req, res) {
    let uploadRecord = null;
    
    try {
      if (!req.file) {
        return ResponseUtils.error(res, 'No file uploaded', 400);
      }

      const { templateId } = req.body;
      let template = null;

      // Create upload record
      uploadRecord = await prisma.upload.create({
        data: {
          originalName: req.file.originalname,
          fileName: req.file.filename,
          filePath: req.file.path,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          templateId: templateId || null,
          status: 'pending'
        }
      });

      // Get template if provided
      if (templateId) {
        const templateResult = await TemplateService.getTemplateById(templateId);
        if (!templateResult.success) {
          throw new Error(`Template not found: ${templateResult.error}`);
        }
        template = templateResult.data;
      }

      let processedImagePath = null;
      let imageMetadata = null;

      // Process image with Sharp if template is provided
      if (template && req.file.mimetype.startsWith('image/')) {
        const processedDir = path.join(__dirname, '../../processed');
        await FileUtils.ensureDirectoryExists(processedDir);
        
        const ext = template.format === 'jpeg' ? 'jpg' : template.format;
        processedImagePath = path.join(processedDir, `processed-${uploadRecord.id}.${ext}`);
        
        // Update status to processing
        await prisma.upload.update({
          where: { id: uploadRecord.id },
          data: { status: 'processing' }
        });

        const processingResult = await ImageProcessingService.processImage(
          req.file.path,
          template,
          processedImagePath
        );

        if (!processingResult.success) {
          throw new Error(`Image processing failed: ${processingResult.error}`);
        }

        imageMetadata = processingResult.data;

        // Update upload record with processed info
        await prisma.upload.update({
          where: { id: uploadRecord.id },
          data: {
            processedPath: processedImagePath,
            originalWidth: imageMetadata.originalWidth,
            originalHeight: imageMetadata.originalHeight,
            processedWidth: imageMetadata.processedWidth,
            processedHeight: imageMetadata.processedHeight
          }
        });
      }

      // Upload to Cloudinary (use processed image if available)
      const uploadPath = processedImagePath || req.file.path;
      const options = {
        folder: req.body.folder || 'uploads',
        quality: req.body.quality || 'auto',
        ...(req.body.width && { width: parseInt(req.body.width) }),
        ...(req.body.height && { height: parseInt(req.body.height) }),
        ...(req.body.crop && { crop: req.body.crop })
      };

      // Determine if it's a video or image
      const isVideo = req.file.mimetype.startsWith('video/');
      
      const cloudinaryResult = isVideo 
        ? await CloudinaryService.uploadVideo(uploadPath, options)
        : await CloudinaryService.uploadImage(uploadPath, options);

      // Clean up local files
      await FileUtils.deleteFile(req.file.path);
      if (processedImagePath) {
        await FileUtils.deleteFile(processedImagePath);
      }

      if (!cloudinaryResult.success) {
        throw new Error(`Cloudinary upload failed: ${cloudinaryResult.error}`);
      }

      // Update upload record with Cloudinary info
      const finalUpload = await prisma.upload.update({
        where: { id: uploadRecord.id },
        data: {
          cloudinaryId: cloudinaryResult.data.public_id,
          cloudinaryUrl: cloudinaryResult.data.url,
          status: 'completed'
        },
        include: {
          template: true
        }
      });

      // Generate image variants if it's an image
      const responseData = {
        upload: finalUpload,
        cloudinary: cloudinaryResult.data,
        processing: imageMetadata,
        originalFile: {
          name: req.file.originalname,
          size: FileUtils.formatFileSize(req.file.size),
          mimetype: req.file.mimetype
        }
      };

      if (!isVideo) {
        responseData.variants = CloudinaryService.generateImageVariants(cloudinaryResult.data.public_id);
      }

      if (template) {
        responseData.templateUsed = {
          id: template.id,
          name: template.name,
          dimensions: `${template.width}x${template.height}`,
          format: template.format
        };
      }

      return ResponseUtils.success(res, responseData, 'File uploaded and processed successfully', 201);

    } catch (error) {
      console.error('Upload error:', error);
      
      // Update upload record with error
      if (uploadRecord) {
        await prisma.upload.update({
          where: { id: uploadRecord.id },
          data: {
            status: 'failed',
            errorMessage: error.message
          }
        }).catch(console.error);
      }
      
      // Clean up local files
      if (req.file?.path) {
        await FileUtils.deleteFile(req.file.path);
      }
      
      return ResponseUtils.error(res, 'Upload failed', 500, error.message);
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return ResponseUtils.error(res, 'No files uploaded', 400);
      }

      const options = {
        folder: req.body.folder || 'uploads',
        quality: req.body.quality || 'auto'
      };

      const uploadResults = await CloudinaryService.uploadMultiple(req.files, options);

      // Clean up local files
      for (const file of req.files) {
        await FileUtils.deleteFile(file.path);
      }

      const successfulUploads = uploadResults.filter(result => result.success);
      const failedUploads = uploadResults.filter(result => !result.success);

      const responseData = {
        successful: successfulUploads.map((result, index) => ({
          ...result.data,
          originalFile: {
            name: req.files[uploadResults.indexOf(result)].originalname,
            size: FileUtils.formatFileSize(req.files[uploadResults.indexOf(result)].size),
            mimetype: req.files[uploadResults.indexOf(result)].mimetype
          }
        })),
        failed: failedUploads.map((result, index) => ({
          error: result.error,
          originalFile: {
            name: req.files[uploadResults.indexOf(result)].originalname
          }
        })),
        summary: {
          total: req.files.length,
          successful: successfulUploads.length,
          failed: failedUploads.length
        }
      };

      const message = failedUploads.length === 0 
        ? 'All files uploaded successfully'
        : `${successfulUploads.length} files uploaded successfully, ${failedUploads.length} failed`;

      return ResponseUtils.success(res, responseData, message, 201);

    } catch (error) {
      console.error('Multiple upload error:', error);
      
      // Clean up local files
      if (req.files) {
        for (const file of req.files) {
          await FileUtils.deleteFile(file.path);
        }
      }
      
      return ResponseUtils.error(res, 'Upload failed', 500, error.message);
    }
  }

  /**
   * Delete file from Cloudinary
   */
  static async deleteFile(req, res) {
    try {
      const { publicId, resourceType = 'image' } = req.body;

      if (!publicId) {
        return ResponseUtils.error(res, 'Public ID is required', 400);
      }

      const result = await CloudinaryService.deleteResource(publicId, resourceType);

      if (!result.success) {
        return ResponseUtils.error(res, 'Delete failed', 500, result.error);
      }

      return ResponseUtils.success(res, result.data, 'File deleted successfully');

    } catch (error) {
      console.error('Delete error:', error);
      return ResponseUtils.error(res, 'Delete failed', 500, error.message);
    }
  }

  /**
   * Get optimized URL for an image
   */
  static async getOptimizedUrl(req, res) {
    try {
      const { publicId } = req.params;
      const transformations = req.query;

      if (!publicId) {
        return ResponseUtils.error(res, 'Public ID is required', 400);
      }

      const optimizedUrl = CloudinaryService.getOptimizedUrl(publicId, transformations);

      return ResponseUtils.success(res, { url: optimizedUrl }, 'Optimized URL generated');

    } catch (error) {
      console.error('Get optimized URL error:', error);
      return ResponseUtils.error(res, 'Failed to generate optimized URL', 500, error.message);
    }
  }

  /**
   * Get image variants
   */
  static async getImageVariants(req, res) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return ResponseUtils.error(res, 'Public ID is required', 400);
      }

      const variants = CloudinaryService.generateImageVariants(publicId);

      return ResponseUtils.success(res, variants, 'Image variants generated');

    } catch (error) {
      console.error('Get image variants error:', error);
      return ResponseUtils.error(res, 'Failed to generate image variants', 500, error.message);
    }
  }
}
