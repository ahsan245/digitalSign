import { TemplateService } from '../services/templateService.js';
import { ResponseUtils } from '../utils/helpers.js';

export class TemplateController {
  /**
   * Create a new template
   */
  static async createTemplate(req, res) {
    try {
      const templateData = req.body;
      
      const result = await TemplateService.createTemplate(templateData);
      
      if (!result.success) {
        return ResponseUtils.error(res, result.error, 400);
      }
      
      return ResponseUtils.success(res, result.data, 'Template created successfully', 201);
    } catch (error) {
      console.error('Create template error:', error);
      return ResponseUtils.error(res, 'Failed to create template', 500, error.message);
    }
  }

  /**
   * Get all templates
   */
  static async getAllTemplates(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        search: req.query.search,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      };
      
      const result = await TemplateService.getAllTemplates(options);
      
      if (!result.success) {
        return ResponseUtils.error(res, result.error, 500);
      }
      
      return ResponseUtils.paginated(res, result.data, result.pagination, 'Templates retrieved successfully');
    } catch (error) {
      console.error('Get templates error:', error);
      return ResponseUtils.error(res, 'Failed to retrieve templates', 500, error.message);
    }
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(req, res) {
    try {
      const { id } = req.params;
      
      const result = await TemplateService.getTemplateById(id);
      
      if (!result.success) {
        return ResponseUtils.error(res, result.error, 404);
      }
      
      return ResponseUtils.success(res, result.data, 'Template retrieved successfully');
    } catch (error) {
      console.error('Get template error:', error);
      return ResponseUtils.error(res, 'Failed to retrieve template', 500, error.message);
    }
  }

  /**
   * Update template
   */
  static async updateTemplate(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const result = await TemplateService.updateTemplate(id, updateData);
      
      if (!result.success) {
        return ResponseUtils.error(res, result.error, 400);
      }
      
      return ResponseUtils.success(res, result.data, 'Template updated successfully');
    } catch (error) {
      console.error('Update template error:', error);
      return ResponseUtils.error(res, 'Failed to update template', 500, error.message);
    }
  }

  /**
   * Delete template
   */
  static async deleteTemplate(req, res) {
    try {
      const { id } = req.params;
      
      const result = await TemplateService.deleteTemplate(id);
      
      if (!result.success) {
        return ResponseUtils.error(res, result.error, 400);
      }
      
      return ResponseUtils.success(res, null, result.message);
    } catch (error) {
      console.error('Delete template error:', error);
      return ResponseUtils.error(res, 'Failed to delete template', 500, error.message);
    }
  }

  /**
   * Set template as default
   */
  static async setDefaultTemplate(req, res) {
    try {
      const { id } = req.params;
      
      const result = await TemplateService.setDefaultTemplate(id);
      
      if (!result.success) {
        return ResponseUtils.error(res, result.error, 400);
      }
      
      return ResponseUtils.success(res, result.data, 'Default template set successfully');
    } catch (error) {
      console.error('Set default template error:', error);
      return ResponseUtils.error(res, 'Failed to set default template', 500, error.message);
    }
  }

  /**
   * Get default template
   */
  static async getDefaultTemplate(req, res) {
    try {
      const result = await TemplateService.getDefaultTemplate();
      
      if (!result.success) {
        return ResponseUtils.error(res, result.error, 404);
      }
      
      return ResponseUtils.success(res, result.data, 'Default template retrieved successfully');
    } catch (error) {
      console.error('Get default template error:', error);
      return ResponseUtils.error(res, 'Failed to retrieve default template', 500, error.message);
    }
  }

  /**
   * Toggle template active status
   */
  static async toggleTemplateStatus(req, res) {
    try {
      const { id } = req.params;
      
      const result = await TemplateService.toggleTemplateStatus(id);
      
      if (!result.success) {
        return ResponseUtils.error(res, result.error, 400);
      }
      
      return ResponseUtils.success(res, result.data, 'Template status updated successfully');
    } catch (error) {
      console.error('Toggle template status error:', error);
      return ResponseUtils.error(res, 'Failed to update template status', 500, error.message);
    }
  }

  /**
   * Duplicate template
   */
  static async duplicateTemplate(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      
      if (!name) {
        return ResponseUtils.error(res, 'New template name is required', 400);
      }
      
      const result = await TemplateService.duplicateTemplate(id, name);
      
      if (!result.success) {
        return ResponseUtils.error(res, result.error, 400);
      }
      
      return ResponseUtils.success(res, result.data, 'Template duplicated successfully', 201);
    } catch (error) {
      console.error('Duplicate template error:', error);
      return ResponseUtils.error(res, 'Failed to duplicate template', 500, error.message);
    }
  }

  /**
   * Get template usage statistics
   */
  static async getTemplateStats(req, res) {
    try {
      const { id } = req.params;
      
      const result = await TemplateService.getTemplateStats(id);
      
      if (!result.success) {
        return ResponseUtils.error(res, result.error, 404);
      }
      
      return ResponseUtils.success(res, result.data, 'Template statistics retrieved successfully');
    } catch (error) {
      console.error('Get template stats error:', error);
      return ResponseUtils.error(res, 'Failed to retrieve template statistics', 500, error.message);
    }
  }

  /**
   * Create default templates
   */
  static async createDefaultTemplates(req, res) {
    try {
      const defaultTemplates = [
        {
          name: 'Social Media Square',
          description: 'Perfect for Instagram posts and social media squares',
          width: 1080,
          height: 1080,
          quality: 85,
          format: 'jpeg',
          fit: 'cover',
          isDefault: true
        },
        {
          name: 'YouTube Thumbnail',
          description: 'Optimized for YouTube video thumbnails',
          width: 1280,
          height: 720,
          quality: 90,
          format: 'jpeg',
          fit: 'cover'
        },
        {
          name: 'Profile Picture',
          description: 'Standard profile picture size',
          width: 400,
          height: 400,
          quality: 85,
          format: 'jpeg',
          fit: 'cover'
        },
        {
          name: 'Web Optimized',
          description: 'Optimized for web usage with smaller file size',
          width: 800,
          height: 600,
          quality: 70,
          format: 'webp',
          fit: 'cover'
        },
        {
          name: 'Print Ready',
          description: 'High quality for print materials',
          width: 3000,
          height: 2000,
          quality: 95,
          format: 'jpeg',
          fit: 'cover'
        }
      ];

      const results = [];
      for (const template of defaultTemplates) {
        const result = await TemplateService.createTemplate(template);
        if (result.success) {
          results.push(result.data);
        }
      }

      return ResponseUtils.success(res, results, `${results.length} default templates created successfully`, 201);
    } catch (error) {
      console.error('Create default templates error:', error);
      return ResponseUtils.error(res, 'Failed to create default templates', 500, error.message);
    }
  }
}
