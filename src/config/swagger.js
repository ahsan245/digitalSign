import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Image Processing API with Templates',
      version: '1.0.0',
      description: 'A comprehensive Node.js API for image upload, processing with Sharp, template management, and Cloudinary integration',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-domain.com' 
          : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      schemas: {
        Template: {
          type: 'object',
          required: ['name', 'width', 'height'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the template',
              example: 'clm9abc123def456'
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Template name',
              example: 'Instagram Square'
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: 'Template description',
              example: 'Perfect for Instagram posts and social media squares'
            },
            width: {
              type: 'integer',
              minimum: 1,
              maximum: 8000,
              description: 'Image width in pixels',
              example: 1080
            },
            height: {
              type: 'integer',
              minimum: 1,
              maximum: 8000,
              description: 'Image height in pixels',
              example: 1080
            },
            quality: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 80,
              description: 'Image quality (1-100)',
              example: 85
            },
            format: {
              type: 'string',
              enum: ['jpeg', 'jpg', 'png', 'webp', 'avif'],
              default: 'jpeg',
              description: 'Output image format',
              example: 'jpeg'
            },
            resizeMode: {
              type: 'string',
              enum: ['cover', 'contain', 'fill', 'inside', 'outside'],
              default: 'cover',
              description: 'How to resize the image',
              example: 'cover'
            },
            fit: {
              type: 'string',
              enum: ['cover', 'contain', 'fill', 'inside', 'outside'],
              default: 'cover',
              description: 'How to fit the image in given dimensions',
              example: 'cover'
            },
            cropMode: {
              type: 'string',
              enum: ['center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
              description: 'Crop position',
              example: 'center'
            },
            cropX: {
              type: 'integer',
              minimum: 0,
              description: 'X position for manual crop',
              example: 100
            },
            cropY: {
              type: 'integer',
              minimum: 0,
              description: 'Y position for manual crop',
              example: 100
            },
            cropWidth: {
              type: 'integer',
              minimum: 1,
              description: 'Width for manual crop',
              example: 500
            },
            cropHeight: {
              type: 'integer',
              minimum: 1,
              description: 'Height for manual crop',
              example: 500
            },
            brightness: {
              type: 'number',
              minimum: -100,
              maximum: 100,
              description: 'Brightness adjustment (-100 to 100)',
              example: 10
            },
            contrast: {
              type: 'number',
              minimum: -100,
              maximum: 100,
              description: 'Contrast adjustment (-100 to 100)',
              example: 5
            },
            saturation: {
              type: 'number',
              minimum: -100,
              maximum: 100,
              description: 'Saturation adjustment (-100 to 100)',
              example: 15
            },
            hue: {
              type: 'number',
              minimum: 0,
              maximum: 360,
              description: 'Hue adjustment (0 to 360)',
              example: 180
            },
            blur: {
              type: 'number',
              minimum: 0.3,
              maximum: 1000,
              description: 'Blur amount (0.3 to 1000)',
              example: 2.5
            },
            sharpen: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Sharpen amount (0 to 100)',
              example: 10
            },
            watermarkEnabled: {
              type: 'boolean',
              default: false,
              description: 'Enable watermark',
              example: false
            },
            watermarkText: {
              type: 'string',
              maxLength: 100,
              description: 'Watermark text',
              example: '© 2024 Company'
            },
            watermarkPosition: {
              type: 'string',
              enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'],
              description: 'Watermark position',
              example: 'bottom-right'
            },
            watermarkOpacity: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Watermark opacity (0 to 1)',
              example: 0.5
            },
            watermarkSize: {
              type: 'integer',
              minimum: 8,
              maximum: 200,
              description: 'Watermark font size',
              example: 24
            },
            backgroundColor: {
              type: 'string',
              pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
              description: 'Background color in hex format',
              example: '#ffffff'
            },
            backgroundBlur: {
              type: 'boolean',
              default: false,
              description: 'Enable background blur',
              example: false
            },
            boxEnabled: {
              type: 'boolean',
              default: false,
              description: 'Enable box/frame around image',
              example: true
            },
            boxColor: {
              type: 'string',
              pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
              default: '#ffffff',
              description: 'Box background color in hex format',
              example: '#f0f0f0'
            },
            boxPadding: {
              type: 'integer',
              minimum: 0,
              maximum: 200,
              default: 20,
              description: 'Padding inside the box (0 to 200px)',
              example: 30
            },
            boxBorderWidth: {
              type: 'integer',
              minimum: 0,
              maximum: 50,
              default: 0,
              description: 'Border width (0 to 50px)',
              example: 2
            },
            boxBorderColor: {
              type: 'string',
              pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
              default: '#000000',
              description: 'Border color in hex format',
              example: '#333333'
            },
            boxBorderRadius: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              default: 0,
              description: 'Border radius (0 to 100px)',
              example: 10
            },
            boxShadowEnabled: {
              type: 'boolean',
              default: false,
              description: 'Enable box shadow',
              example: true
            },
            boxShadowBlur: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              default: 10,
              description: 'Shadow blur amount (0 to 100px)',
              example: 15
            },
            boxShadowOffsetX: {
              type: 'integer',
              minimum: -100,
              maximum: 100,
              default: 5,
              description: 'Shadow horizontal offset (-100 to 100px)',
              example: 8
            },
            boxShadowOffsetY: {
              type: 'integer',
              minimum: -100,
              maximum: 100,
              default: 5,
              description: 'Shadow vertical offset (-100 to 100px)',
              example: 8
            },
            boxShadowOpacity: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              default: 0.3,
              description: 'Shadow opacity (0 to 1)',
              example: 0.4
            },
            boxShadowColor: {
              type: 'string',
              pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
              default: '#000000',
              description: 'Shadow color in hex format',
              example: '#666666'
            },
            progressive: {
              type: 'boolean',
              default: true,
              description: 'Enable progressive JPEG',
              example: true
            },
            optimizeScans: {
              type: 'boolean',
              default: true,
              description: 'Optimize progressive scans',
              example: true
            },
            stripMetadata: {
              type: 'boolean',
              default: true,
              description: 'Strip image metadata',
              example: true
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Template active status',
              example: true
            },
            isDefault: {
              type: 'boolean',
              default: false,
              description: 'Is default template',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2024-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-01T00:00:00.000Z'
            }
          }
        },
        Upload: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the upload',
              example: 'clm9xyz789abc123'
            },
            originalName: {
              type: 'string',
              description: 'Original file name',
              example: 'vacation-photo.jpg'
            },
            fileName: {
              type: 'string',
              description: 'Generated file name',
              example: 'file-1640995200000-123456789.jpg'
            },
            filePath: {
              type: 'string',
              description: 'Local file path',
              example: '/uploads/file-1640995200000-123456789.jpg'
            },
            mimeType: {
              type: 'string',
              description: 'File MIME type',
              example: 'image/jpeg'
            },
            fileSize: {
              type: 'integer',
              description: 'File size in bytes',
              example: 2048576
            },
            processedPath: {
              type: 'string',
              description: 'Processed file path',
              example: '/processed/processed-clm9xyz789abc123.jpg'
            },
            processedUrl: {
              type: 'string',
              description: 'Processed file URL',
              example: 'https://res.cloudinary.com/demo/processed-image.jpg'
            },
            cloudinaryId: {
              type: 'string',
              description: 'Cloudinary public ID',
              example: 'uploads/sample-image'
            },
            cloudinaryUrl: {
              type: 'string',
              description: 'Cloudinary URL',
              example: 'https://res.cloudinary.com/demo/image/upload/v1640995200/uploads/sample-image.jpg'
            },
            originalWidth: {
              type: 'integer',
              description: 'Original image width',
              example: 1920
            },
            originalHeight: {
              type: 'integer',
              description: 'Original image height',
              example: 1080
            },
            processedWidth: {
              type: 'integer',
              description: 'Processed image width',
              example: 1080
            },
            processedHeight: {
              type: 'integer',
              description: 'Processed image height',
              example: 1080
            },
            templateId: {
              type: 'string',
              description: 'Template ID used for processing',
              example: 'clm9abc123def456'
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'failed'],
              description: 'Upload processing status',
              example: 'completed'
            },
            errorMessage: {
              type: 'string',
              description: 'Error message if upload failed',
              example: 'Invalid image format'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Upload timestamp',
              example: '2024-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-01T00:00:00.000Z'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Error message'
            },
            details: {
              type: 'string',
              description: 'Additional error details'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Data retrieved successfully'
            },
            data: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                currentPage: {
                  type: 'integer',
                  example: 1
                },
                totalPages: {
                  type: 'integer',
                  example: 10
                },
                totalItems: {
                  type: 'integer',
                  example: 100
                },
                itemsPerPage: {
                  type: 'integer',
                  example: 10
                },
                hasNextPage: {
                  type: 'boolean',
                  example: true
                },
                hasPrevPage: {
                  type: 'boolean',
                  example: false
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Templates',
        description: 'Template management operations'
      },
      {
        name: 'Uploads',
        description: 'File upload and processing operations'
      },
      {
        name: 'Health',
        description: 'Health check endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
