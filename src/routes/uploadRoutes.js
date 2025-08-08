import express from 'express';
import { UploadController } from '../controllers/uploadController.js';
import { uploadSingle, uploadMultiple, handleMulterError } from '../middlewares/upload.js';
import { validate, validateFileUpload, validateMultipleFiles, fileUploadWithTemplateSchema } from '../middlewares/validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/upload/single:
 *   post:
 *     summary: Upload single file with optional template processing
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image or video file to upload
 *               templateId:
 *                 type: string
 *                 description: Template ID for image processing
 *                 example: "clm9abc123def456"
 *               folder:
 *                 type: string
 *                 description: Cloudinary folder name
 *                 default: "uploads"
 *                 example: "uploads"
 *               quality:
 *                 type: string
 *                 enum: [auto, best, good, eco, low]
 *                 default: "auto"
 *                 description: Image quality
 *               format:
 *                 type: string
 *                 enum: [auto, jpg, png, webp, gif]
 *                 description: Output format
 *               width:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 4000
 *                 description: Image width (ignored if templateId provided)
 *               height:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 4000
 *                 description: Image height (ignored if templateId provided)
 *               crop:
 *                 type: string
 *                 enum: [fit, fill, scale, crop, thumb, limit, mfit, lfill]
 *                 default: "fit"
 *                 description: Crop mode (ignored if templateId provided)
 *     responses:
 *       201:
 *         description: File uploaded and processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "File uploaded and processed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     upload:
 *                       $ref: '#/components/schemas/Upload'
 *                     cloudinary:
 *                       type: object
 *                       description: Cloudinary upload result
 *                     processing:
 *                       type: object
 *                       description: Image processing metadata
 *                     originalFile:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         size:
 *                           type: string
 *                         mimetype:
 *                           type: string
 *                     variants:
 *                       type: object
 *                       description: Image variants (thumbnails, different sizes)
 *                     templateUsed:
 *                       type: object
 *                       description: Template information used for processing
 *       400:
 *         description: Validation error or no file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Upload or processing failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/single', 
  uploadSingle,
  handleMulterError,
  validateFileUpload,
  validate(fileUploadWithTemplateSchema, 'body'),
  UploadController.uploadSingle
);

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple image or video files (max 10)
 *               templateId:
 *                 type: string
 *                 description: Template ID for image processing
 *               folder:
 *                 type: string
 *                 description: Cloudinary folder name
 *                 default: "uploads"
 *               quality:
 *                 type: string
 *                 enum: [auto, best, good, eco, low]
 *                 default: "auto"
 *                 description: Image quality
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error or no files uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/multiple',
  uploadMultiple,
  handleMulterError,
  validateMultipleFiles,
  validate(fileUploadWithTemplateSchema, 'body'),
  UploadController.uploadMultiple
);

/**
 * @swagger
 * /api/upload/delete:
 *   delete:
 *     summary: Delete file from Cloudinary
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - publicId
 *             properties:
 *               publicId:
 *                 type: string
 *                 description: Cloudinary public ID
 *                 example: "uploads/sample-image"
 *               resourceType:
 *                 type: string
 *                 enum: [image, video, raw]
 *                 default: "image"
 *                 description: Resource type
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Public ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/delete', UploadController.deleteFile);

/**
 * @swagger
 * /api/upload/optimize/{publicId}:
 *   get:
 *     summary: Get optimized URL for image
 *     tags: [Uploads]
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public ID
 *         example: "uploads/sample-image"
 *       - in: query
 *         name: width
 *         schema:
 *           type: integer
 *         description: Image width
 *       - in: query
 *         name: height
 *         schema:
 *           type: integer
 *         description: Image height
 *       - in: query
 *         name: quality
 *         schema:
 *           type: string
 *         description: Image quality
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *         description: Image format
 *     responses:
 *       200:
 *         description: Optimized URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get('/optimize/:publicId', UploadController.getOptimizedUrl);

/**
 * @swagger
 * /api/upload/variants/{publicId}:
 *   get:
 *     summary: Get image variants (thumbnails, different sizes)
 *     tags: [Uploads]
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public ID
 *         example: "uploads/sample-image"
 *     responses:
 *       200:
 *         description: Image variants generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Image variants generated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     thumbnail:
 *                       type: string
 *                       description: Thumbnail URL (150x150)
 *                     small:
 *                       type: string
 *                       description: Small size URL (300x300)
 *                     medium:
 *                       type: string
 *                       description: Medium size URL (600x600)
 *                     large:
 *                       type: string
 *                       description: Large size URL (1200x1200)
 *                     original:
 *                       type: string
 *                       description: Original optimized URL
 */
router.get('/variants/:publicId', UploadController.getImageVariants);

/**
 * @route GET /api/upload/test
 * @desc Test endpoint
 * @access Public
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Upload routes are working!',
    endpoints: {
      single: 'POST /api/upload/single',
      multiple: 'POST /api/upload/multiple',
      delete: 'DELETE /api/upload/delete',
      optimize: 'GET /api/upload/optimize/:publicId',
      variants: 'GET /api/upload/variants/:publicId'
    },
    usage: {
      single: {
        method: 'POST',
        url: '/api/upload/single',
        body: 'FormData with file field',
        optional_params: ['folder', 'quality', 'width', 'height', 'crop']
      },
      multiple: {
        method: 'POST',
        url: '/api/upload/multiple',
        body: 'FormData with files field (max 10 files)',
        optional_params: ['folder', 'quality']
      }
    }
  });
});

export default router;
