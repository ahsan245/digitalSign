import express from 'express';
import { TemplateController } from '../controllers/templateController.js';
import { validate, templateCreateSchema, templateUpdateSchema, paginationSchema } from '../middlewares/validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/templates:
 *   post:
 *     summary: Create a new template
 *     tags: [Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Template'
 *           example:
 *             name: "Instagram Square"
 *             description: "Perfect for Instagram posts"
 *             width: 1080
 *             height: 1080
 *             quality: 85
 *             format: "jpeg"
 *             fit: "cover"
 *     responses:
 *       201:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/',
  validate(templateCreateSchema, 'body'),
  TemplateController.createTemplate
);

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Get all templates with pagination and filtering
 *     tags: [Templates]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name and description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, name, width, height]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/',
  validate(paginationSchema, 'query'),
  TemplateController.getAllTemplates
);

/**
 * @swagger
 * /api/templates/default:
 *   get:
 *     summary: Get default template
 *     tags: [Templates]
 *     responses:
 *       200:
 *         description: Default template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: No default template found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/default', TemplateController.getDefaultTemplate);

/**
 * @swagger
 * /api/templates/create-defaults:
 *   post:
 *     summary: Create default templates
 *     tags: [Templates]
 *     responses:
 *       201:
 *         description: Default templates created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/create-defaults', TemplateController.createDefaultTemplates);

/**
 * @swagger
 * /api/templates/{id}:
 *   get:
 *     summary: Get template by ID
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Template not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', TemplateController.getTemplateById);

/**
 * @swagger
 * /api/templates/{id}:
 *   put:
 *     summary: Update template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Template'
 *     responses:
 *       200:
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Template not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id',
  validate(templateUpdateSchema, 'body'),
  TemplateController.updateTemplate
);

/**
 * @swagger
 * /api/templates/{id}:
 *   delete:
 *     summary: Delete template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Cannot delete template with associated uploads
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Template not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', TemplateController.deleteTemplate);

/**
 * @swagger
 * /api/templates/{id}/default:
 *   patch:
 *     summary: Set template as default
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Default template set successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.patch('/:id/default', TemplateController.setDefaultTemplate);

/**
 * @swagger
 * /api/templates/{id}/toggle-status:
 *   patch:
 *     summary: Toggle template active status
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.patch('/:id/toggle-status', TemplateController.toggleTemplateStatus);

/**
 * @swagger
 * /api/templates/{id}/duplicate:
 *   post:
 *     summary: Duplicate template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID to duplicate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: New template name
 *                 example: "Instagram Square Copy"
 *     responses:
 *       201:
 *         description: Template duplicated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/:id/duplicate', TemplateController.duplicateTemplate);

/**
 * @swagger
 * /api/templates/{id}/stats:
 *   get:
 *     summary: Get template usage statistics
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get('/:id/stats', TemplateController.getTemplateStats);

/**
 * @route GET /api/templates/test
 * @desc Test endpoint
 * @access Public
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Template routes are working!',
    endpoints: {
      create: 'POST /api/templates',
      getAll: 'GET /api/templates',
      getById: 'GET /api/templates/:id',
      update: 'PUT /api/templates/:id',
      delete: 'DELETE /api/templates/:id',
      setDefault: 'PATCH /api/templates/:id/default',
      toggleStatus: 'PATCH /api/templates/:id/toggle-status',
      duplicate: 'POST /api/templates/:id/duplicate',
      getStats: 'GET /api/templates/:id/stats',
      getDefault: 'GET /api/templates/default',
      createDefaults: 'POST /api/templates/create-defaults'
    },
    sampleTemplate: {
      name: 'Instagram Square',
      description: 'Perfect for Instagram posts',
      width: 1080,
      height: 1080,
      quality: 85,
      format: 'jpeg',
      fit: 'cover',
      watermarkEnabled: false,
      progressive: true,
      stripMetadata: true
    }
  });
});

export default router;
