import prisma from './prismaService.js';

export class TemplateService {
  /**
   * Create a new template
   * @param {object} templateData - Template data
   * @returns {Promise<object>} Created template
   */
  static async createTemplate(templateData) {
    try {
      const template = await prisma.template.create({
        data: templateData
      });
      return { success: true, data: template };
    } catch (error) {
      console.error('Template creation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all templates
   * @param {object} options - Query options
   * @returns {Promise<object>} Templates list
   */
  static async getAllTemplates(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        isActive,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;
      const where = {};

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [templates, total] = await Promise.all([
        prisma.template.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            _count: {
              select: { uploads: true }
            }
          }
        }),
        prisma.template.count({ where })
      ]);

      return {
        success: true,
        data: templates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Get templates error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get template by ID
   * @param {string} id - Template ID
   * @returns {Promise<object>} Template data
   */
  static async getTemplateById(id) {
    try {
      const template = await prisma.template.findUnique({
        where: { id },
        include: {
          _count: {
            select: { uploads: true }
          }
        }
      });

      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      return { success: true, data: template };
    } catch (error) {
      console.error('Get template error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get template by name
   * @param {string} name - Template name
   * @returns {Promise<object>} Template data
   */
  static async getTemplateByName(name) {
    try {
      const template = await prisma.template.findUnique({
        where: { name }
      });

      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      return { success: true, data: template };
    } catch (error) {
      console.error('Get template by name error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update template
   * @param {string} id - Template ID
   * @param {object} updateData - Update data
   * @returns {Promise<object>} Updated template
   */
  static async updateTemplate(id, updateData) {
    try {
      const template = await prisma.template.update({
        where: { id },
        data: updateData
      });

      return { success: true, data: template };
    } catch (error) {
      console.error('Update template error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete template
   * @param {string} id - Template ID
   * @returns {Promise<object>} Deletion result
   */
  static async deleteTemplate(id) {
    try {
      // Check if template has uploads
      const uploadsCount = await prisma.upload.count({
        where: { templateId: id }
      });

      if (uploadsCount > 0) {
        return { 
          success: false, 
          error: `Cannot delete template. It has ${uploadsCount} associated uploads.`
        };
      }

      await prisma.template.delete({
        where: { id }
      });

      return { success: true, message: 'Template deleted successfully' };
    } catch (error) {
      console.error('Delete template error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Set template as default
   * @param {string} id - Template ID
   * @returns {Promise<object>} Update result
   */
  static async setDefaultTemplate(id) {
    try {
      // First, remove default from all templates
      await prisma.template.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });

      // Set the specified template as default
      const template = await prisma.template.update({
        where: { id },
        data: { isDefault: true, isActive: true }
      });

      return { success: true, data: template };
    } catch (error) {
      console.error('Set default template error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get default template
   * @returns {Promise<object>} Default template
   */
  static async getDefaultTemplate() {
    try {
      const template = await prisma.template.findFirst({
        where: { isDefault: true, isActive: true }
      });

      if (!template) {
        return { success: false, error: 'No default template found' };
      }

      return { success: true, data: template };
    } catch (error) {
      console.error('Get default template error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle template active status
   * @param {string} id - Template ID
   * @returns {Promise<object>} Updated template
   */
  static async toggleTemplateStatus(id) {
    try {
      const currentTemplate = await prisma.template.findUnique({
        where: { id }
      });

      if (!currentTemplate) {
        return { success: false, error: 'Template not found' };
      }

      const template = await prisma.template.update({
        where: { id },
        data: { isActive: !currentTemplate.isActive }
      });

      return { success: true, data: template };
    } catch (error) {
      console.error('Toggle template status error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Duplicate template
   * @param {string} id - Template ID to duplicate
   * @param {string} newName - New template name
   * @returns {Promise<object>} Duplicated template
   */
  static async duplicateTemplate(id, newName) {
    try {
      const originalTemplate = await prisma.template.findUnique({
        where: { id }
      });

      if (!originalTemplate) {
        return { success: false, error: 'Original template not found' };
      }

      // Remove id, timestamps, and unique fields
      const { id: _, createdAt, updatedAt, name, isDefault, ...templateData } = originalTemplate;

      const duplicatedTemplate = await prisma.template.create({
        data: {
          ...templateData,
          name: newName,
          isDefault: false,
          isActive: true
        }
      });

      return { success: true, data: duplicatedTemplate };
    } catch (error) {
      console.error('Duplicate template error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get template usage statistics
   * @param {string} id - Template ID
   * @returns {Promise<object>} Usage statistics
   */
  static async getTemplateStats(id) {
    try {
      const [template, uploadsCount, recentUploads] = await Promise.all([
        prisma.template.findUnique({ where: { id } }),
        prisma.upload.count({ where: { templateId: id } }),
        prisma.upload.findMany({
          where: { templateId: id },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            originalName: true,
            status: true,
            createdAt: true
          }
        })
      ]);

      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      return {
        success: true,
        data: {
          template,
          stats: {
            totalUploads: uploadsCount,
            recentUploads
          }
        }
      };
    } catch (error) {
      console.error('Get template stats error:', error);
      return { success: false, error: error.message };
    }
  }
}
