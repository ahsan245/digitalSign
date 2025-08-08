import Joi from 'joi';

/**
 * Validation middleware factory
 * @param {object} schema - Joi validation schema
 * @param {string} property - Property to validate (body, query, params)
 * @returns {function} Express middleware function
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorDetails
      });
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Template validation schemas
 */
export const templateCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Template name is required',
    'string.min': 'Template name must be at least 2 characters long',
    'string.max': 'Template name cannot exceed 100 characters'
  }),
  description: Joi.string().max(500).optional(),
  
  // Image dimensions (required)
  width: Joi.number().integer().min(1).max(8000).required().messages({
    'number.base': 'Width must be a number',
    'number.min': 'Width must be at least 1px',
    'number.max': 'Width cannot exceed 8000px'
  }),
  height: Joi.number().integer().min(1).max(8000).required().messages({
    'number.base': 'Height must be a number',
    'number.min': 'Height must be at least 1px',
    'number.max': 'Height cannot exceed 8000px'
  }),
  
  // Image processing options
  quality: Joi.number().integer().min(1).max(100).default(80),
  format: Joi.string().valid('jpeg', 'jpg', 'png', 'webp', 'avif').default('jpeg'),
  
  // Resize options
  resizeMode: Joi.string().valid('cover', 'contain', 'fill', 'inside', 'outside').default('cover'),
  fit: Joi.string().valid('cover', 'contain', 'fill', 'inside', 'outside').default('cover'),
  
  // Crop options
  cropMode: Joi.string().valid('center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right').optional(),
  cropX: Joi.number().integer().min(0).optional(),
  cropY: Joi.number().integer().min(0).optional(),
  cropWidth: Joi.number().integer().min(1).optional(),
  cropHeight: Joi.number().integer().min(1).optional(),
  
  // Filters and effects
  brightness: Joi.number().min(-100).max(100).optional(),
  contrast: Joi.number().min(-100).max(100).optional(),
  saturation: Joi.number().min(-100).max(100).optional(),
  hue: Joi.number().min(0).max(360).optional(),
  blur: Joi.number().min(0.3).max(1000).optional(),
  sharpen: Joi.number().min(0).max(100).optional(),
  
  // Watermark options
  watermarkEnabled: Joi.boolean().default(false),
  watermarkText: Joi.string().max(100).optional(),
  watermarkPosition: Joi.string().valid('top-left', 'top-right', 'bottom-left', 'bottom-right', 'center').optional(),
  watermarkOpacity: Joi.number().min(0).max(1).optional(),
  watermarkSize: Joi.number().integer().min(8).max(200).optional(),
  
  // Background options
  backgroundColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  backgroundBlur: Joi.boolean().default(false),
  
  // Box/Frame options
  boxEnabled: Joi.boolean().default(false),
  boxColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#ffffff'),
  boxPadding: Joi.number().integer().min(0).max(200).default(20),
  boxBorderWidth: Joi.number().integer().min(0).max(50).default(0),
  boxBorderColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#000000'),
  boxBorderRadius: Joi.number().integer().min(0).max(100).default(0),
  boxShadowEnabled: Joi.boolean().default(false),
  boxShadowBlur: Joi.number().integer().min(0).max(100).default(10),
  boxShadowOffsetX: Joi.number().integer().min(-100).max(100).default(5),
  boxShadowOffsetY: Joi.number().integer().min(-100).max(100).default(5),
  boxShadowOpacity: Joi.number().min(0).max(1).default(0.3),
  boxShadowColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#000000'),
  
  // Output options
  progressive: Joi.boolean().default(true),
  optimizeScans: Joi.boolean().default(true),
  stripMetadata: Joi.boolean().default(true),
  
  // Template settings
  isActive: Joi.boolean().default(true),
  isDefault: Joi.boolean().default(false)
});

export const templateUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional(),
  
  // Image dimensions
  width: Joi.number().integer().min(1).max(8000).optional(),
  height: Joi.number().integer().min(1).max(8000).optional(),
  
  // Image processing options
  quality: Joi.number().integer().min(1).max(100).optional(),
  format: Joi.string().valid('jpeg', 'jpg', 'png', 'webp', 'avif').optional(),
  
  // Resize options
  resizeMode: Joi.string().valid('cover', 'contain', 'fill', 'inside', 'outside').optional(),
  fit: Joi.string().valid('cover', 'contain', 'fill', 'inside', 'outside').optional(),
  
  // Crop options
  cropMode: Joi.string().valid('center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right').optional(),
  cropX: Joi.number().integer().min(0).optional(),
  cropY: Joi.number().integer().min(0).optional(),
  cropWidth: Joi.number().integer().min(1).optional(),
  cropHeight: Joi.number().integer().min(1).optional(),
  
  // Filters and effects
  brightness: Joi.number().min(-100).max(100).optional(),
  contrast: Joi.number().min(-100).max(100).optional(),
  saturation: Joi.number().min(-100).max(100).optional(),
  hue: Joi.number().min(0).max(360).optional(),
  blur: Joi.number().min(0.3).max(1000).optional(),
  sharpen: Joi.number().min(0).max(100).optional(),
  
  // Watermark options
  watermarkEnabled: Joi.boolean().optional(),
  watermarkText: Joi.string().max(100).optional(),
  watermarkPosition: Joi.string().valid('top-left', 'top-right', 'bottom-left', 'bottom-right', 'center').optional(),
  watermarkOpacity: Joi.number().min(0).max(1).optional(),
  watermarkSize: Joi.number().integer().min(8).max(200).optional(),
  
  // Background options
  backgroundColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  backgroundBlur: Joi.boolean().optional(),
  
  // Box/Frame options
  boxEnabled: Joi.boolean().optional(),
  boxColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  boxPadding: Joi.number().integer().min(0).max(200).optional(),
  boxBorderWidth: Joi.number().integer().min(0).max(50).optional(),
  boxBorderColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  boxBorderRadius: Joi.number().integer().min(0).max(100).optional(),
  boxShadowEnabled: Joi.boolean().optional(),
  boxShadowBlur: Joi.number().integer().min(0).max(100).optional(),
  boxShadowOffsetX: Joi.number().integer().min(-100).max(100).optional(),
  boxShadowOffsetY: Joi.number().integer().min(-100).max(100).optional(),
  boxShadowOpacity: Joi.number().min(0).max(1).optional(),
  boxShadowColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  
  // Output options
  progressive: Joi.boolean().optional(),
  optimizeScans: Joi.boolean().optional(),
  stripMetadata: Joi.boolean().optional(),
  
  // Template settings
  isActive: Joi.boolean().optional(),
  isDefault: Joi.boolean().optional()
});

/**
 * File upload validation schema with template ID
 */
export const fileUploadWithTemplateSchema = Joi.object({
  templateId: Joi.string().optional(),
  folder: Joi.string().optional().default('uploads'),
  quality: Joi.string().valid('auto', 'best', 'good', 'eco', 'low').optional().default('auto'),
  format: Joi.string().valid('auto', 'jpg', 'png', 'webp', 'gif').optional(),
  width: Joi.number().integer().min(1).max(4000).optional(),
  height: Joi.number().integer().min(1).max(4000).optional(),
  crop: Joi.string().valid('fit', 'fill', 'scale', 'crop', 'thumb', 'limit', 'mfit', 'lfill').optional().default('fit')
});

/**
 * File upload validation schema
 */
export const fileUploadSchema = Joi.object({
  folder: Joi.string().optional().default('uploads'),
  quality: Joi.string().valid('auto', 'best', 'good', 'eco', 'low').optional().default('auto'),
  format: Joi.string().valid('auto', 'jpg', 'png', 'webp', 'gif').optional(),
  width: Joi.number().integer().min(1).max(4000).optional(),
  height: Joi.number().integer().min(1).max(4000).optional(),
  crop: Joi.string().valid('fit', 'fill', 'scale', 'crop', 'thumb', 'limit', 'mfit', 'lfill').optional().default('fit')
});

/**
 * User registration schema
 */
export const userRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required'
  }),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match'
  })
});

/**
 * User login schema
 */
export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * ID parameter validation schema
 */
export const idParamSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid ID format'
  })
});

/**
 * Query parameters schema for pagination
 */
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('createdAt', '-createdAt', 'name', '-name').default('-createdAt'),
  search: Joi.string().max(100).optional()
});

/**
 * File validation middleware
 */
export const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }

  const file = req.file || (req.files && req.files[0]);
  
  // Check file size (5MB limit)
  const maxSize = process.env.MAX_FILE_SIZE || 5242880; // 5MB
  if (file.size > maxSize) {
    return res.status(400).json({
      success: false,
      error: `File size too large. Maximum size is ${maxSize / 1024 / 1024}MB`
    });
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov'];
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, AVI, MOV) are allowed'
    });
  }

  next();
};

/**
 * Multiple files validation middleware
 */
export const validateMultipleFiles = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded'
    });
  }

  const maxFiles = 10;
  if (req.files.length > maxFiles) {
    return res.status(400).json({
      success: false,
      error: `Too many files. Maximum ${maxFiles} files allowed`
    });
  }

  // Validate each file
  const maxSize = process.env.MAX_FILE_SIZE || 5242880; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov'];

  for (const file of req.files) {
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: `File ${file.originalname} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`
      });
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: `File ${file.originalname} has invalid type. Only images and videos are allowed`
      });
    }
  }

  next();
};
