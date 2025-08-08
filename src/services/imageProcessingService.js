import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export class ImageProcessingService {
  /**
   * Process image based on template configuration
   * @param {string} inputPath - Input image path
   * @param {object} template - Template configuration
   * @param {string} outputPath - Output image path
   * @returns {Promise<object>} Processing result
   */








  static async processImage(inputPath, template, outputPath) {
    try {
      let image = sharp(inputPath);
      
      // Get original image metadata
      const metadata = await image.metadata();
      
      // Apply transformations based on template
      image = await this.applyDimensions(image, template, metadata);
    //   image = await this.applyFilters(image, template);
    //   image = await this.applyBox(image, template);
    //   image = await this.applyWatermark(image, template);
    //   image = await this.applyOutputOptions(image, template);
      
      // Save processed image
      await image.toFile(outputPath);
      
      // Get processed image info
      const processedMetadata = await sharp(outputPath).metadata();
      
      return {
        success: true,
        data: {
          originalWidth: metadata.width,
          originalHeight: metadata.height,
          processedWidth: processedMetadata.width,
          processedHeight: processedMetadata.height,
          format: processedMetadata.format,
          size: (await fs.stat(outputPath)).size
        }
      };
    } catch (error) {
      console.error('Image processing error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply dimension transformations
   * @param {object} image - Sharp image object
   * @param {object} template - Template configuration
   * @param {object} metadata - Original image metadata
   * @returns {object} Transformed image
   */
  static async applyDimensions(image, template, metadata) {
    const { width, height, resizeMode, fit, cropMode, cropX, cropY, cropWidth, cropHeight } = template;
    
    // Handle manual cropping first if specified
    if (cropX !== null && cropY !== null && cropWidth && cropHeight) {
      image = image.extract({
        left: cropX,
        top: cropY,
        width: cropWidth,
        height: cropHeight
      });
    }
    
    // Apply resize based on template settings
    const resizeOptions = {
      width,
      height,
      fit: this.getSharpFit(fit),
      withoutEnlargement: false
    };
    
    // Add background color if specified
    if (template.backgroundColor) {
      resizeOptions.background = template.backgroundColor;
    }
    
    image = image.resize(resizeOptions);
    
    return image;
  }

  /**
   * Apply image filters and effects
   * @param {object} image - Sharp image object
   * @param {object} template - Template configuration
   * @returns {object} Filtered image
   */
  static async applyFilters(image, template) {
    const { brightness, contrast, saturation, hue, blur, sharpen } = template;
    
    // Apply modulate (brightness, saturation, hue)
    const modulateOptions = {};
    if (brightness !== null) modulateOptions.brightness = 1 + (brightness / 100);
    if (saturation !== null) modulateOptions.saturation = 1 + (saturation / 100);
    if (hue !== null) modulateOptions.hue = hue;
    
    if (Object.keys(modulateOptions).length > 0) {
      image = image.modulate(modulateOptions);
    }
    
    // Apply linear (contrast)
    if (contrast !== null) {
      const a = 1 + (contrast / 100);
      const b = 128 * (1 - a);
      image = image.linear(a, b);
    }
    
    // Apply blur
    if (blur !== null && blur > 0) {
      image = image.blur(blur);
    }
    
    // Apply sharpen
    if (sharpen !== null && sharpen > 0) {
      image = image.sharpen(sharpen);
    }
    
    return image;
  }

  /**
   * Apply box/frame effects to the image
   * @param {object} image - Sharp image object
   * @param {object} template - Template configuration
   * @returns {object} Boxed image
   */
  static async applyBox(image, template) {
    if (!template.boxEnabled) {
      return image;
    }

    try {
      const { width, height } = await image.metadata();
      const {
        boxColor = '#ffffff',
        boxPadding = 20,
        boxBorderWidth = 0,
        boxBorderColor = '#000000',
        boxBorderRadius = 0,
        boxShadowEnabled = false,
        boxShadowBlur = 10,
        boxShadowOffsetX = 5,
        boxShadowOffsetY = 5,
        boxShadowOpacity = 0.3,
        boxShadowColor = '#000000'
      } = template;

      // Calculate total dimensions needed for the box
      const totalPadding = boxPadding * 2;
      const totalBorder = boxBorderWidth * 2;
      const shadowOffset = boxShadowEnabled ? Math.max(Math.abs(boxShadowOffsetX), Math.abs(boxShadowOffsetY)) + boxShadowBlur : 0;
      
      const boxWidth = width + totalPadding + totalBorder;
      const boxHeight = height + totalPadding + totalBorder;
      const canvasWidth = boxWidth + shadowOffset * 2;
      const canvasHeight = boxHeight + shadowOffset * 2;

      // Get the current image as a buffer
      const imageBuffer = await image.toBuffer();

      // Create the box background with optional shadow
      const boxSvg = this.createBoxSvg({
        width: canvasWidth,
        height: canvasHeight,
        boxWidth,
        boxHeight,
        boxColor,
        boxBorderWidth,
        boxBorderColor,
        boxBorderRadius,
        boxShadowEnabled,
        boxShadowBlur,
        boxShadowOffsetX,
        boxShadowOffsetY,
        boxShadowOpacity,
        boxShadowColor,
        shadowOffset
      });

      const boxBuffer = Buffer.from(boxSvg);

      // Calculate image position within the box
      const imageLeft = shadowOffset + boxBorderWidth + boxPadding;
      const imageTop = shadowOffset + boxBorderWidth + boxPadding;

      // Create the final composite image
      const result = sharp(boxBuffer)
        .composite([{
          input: imageBuffer,
          left: imageLeft,
          top: imageTop,
          blend: 'over'
        }]);

      return result;
    } catch (error) {
      console.error('Box application error:', error);
      return image;
    }
  }

  /**
   * Create SVG for box with shadow and border
   * @param {object} options - Box options
   * @returns {string} SVG string
   */
  static createBoxSvg(options) {
    const {
      width,
      height,
      boxWidth,
      boxHeight,
      boxColor,
      boxBorderWidth,
      boxBorderColor,
      boxBorderRadius,
      boxShadowEnabled,
      boxShadowBlur,
      boxShadowOffsetX,
      boxShadowOffsetY,
      boxShadowOpacity,
      boxShadowColor,
      shadowOffset
    } = options;

    const boxX = shadowOffset;
    const boxY = shadowOffset;

    let shadowDef = '';
    let shadowFilter = '';

    if (boxShadowEnabled) {
      const shadowId = 'boxShadow';
      shadowDef = `
        <defs>
          <filter id="${shadowId}" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="${boxShadowOffsetX}" dy="${boxShadowOffsetY}" 
                         stdDeviation="${boxShadowBlur / 2}" 
                         flood-color="${boxShadowColor}" 
                         flood-opacity="${boxShadowOpacity}"/>
          </filter>
        </defs>
      `;
      shadowFilter = `filter="url(#${shadowId})"`;
    }

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${shadowDef}
        <rect x="${boxX}" y="${boxY}" 
              width="${boxWidth}" height="${boxHeight}"
              fill="${boxColor}"
              stroke="${boxBorderColor}"
              stroke-width="${boxBorderWidth}"
              rx="${boxBorderRadius}"
              ry="${boxBorderRadius}"
              ${shadowFilter}/>
      </svg>
    `;
  }

  /**
   * Apply watermark if enabled
   * @param {object} image - Sharp image object
   * @param {object} template - Template configuration
   * @returns {object} Watermarked image
   */
  static async applyWatermark(image, template) {
    if (!template.watermarkEnabled || !template.watermarkText) {
      return image;
    }
    
    const { watermarkText, watermarkPosition, watermarkOpacity, watermarkSize } = template;
    
    try {
      // Get image dimensions for positioning
      const { width, height } = await image.metadata();
      
      // Create text watermark using SVG
      const fontSize = watermarkSize || Math.max(width, height) * 0.05;
      const opacity = watermarkOpacity || 0.5;
      
      // Calculate position
      const position = this.getWatermarkPosition(watermarkPosition || 'bottom-right', width, height, fontSize);
      
      const svgText = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <text x="${position.x}" y="${position.y}" 
                font-family="Arial, sans-serif" 
                font-size="${fontSize}" 
                fill="white" 
                fill-opacity="${opacity}"
                text-anchor="${position.anchor}"
                dominant-baseline="${position.baseline}">
            ${watermarkText}
          </text>
        </svg>
      `;
      
      const watermarkBuffer = Buffer.from(svgText);
      
      image = image.composite([{
        input: watermarkBuffer,
        blend: 'over'
      }]);
      
    } catch (error) {
      console.error('Watermark application error:', error);
    }
    
    return image;
  }

  /**
   * Apply output format and quality options
   * @param {object} image - Sharp image object
   * @param {object} template - Template configuration
   * @returns {object} Output configured image
   */
  static async applyOutputOptions(image, template) {
    const { format, quality, progressive, optimizeScans, stripMetadata } = template;
    
    // Strip metadata if specified
    if (stripMetadata) {
      image = image.withMetadata({});
    }
    
    // Apply format-specific options
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        image = image.jpeg({
          quality,
          progressive,
          optimizeScans,
          mozjpeg: true
        });
        break;
        
      case 'png':
        image = image.png({
          quality,
          progressive,
          compressionLevel: 9,
          palette: true
        });
        break;
        
      case 'webp':
        image = image.webp({
          quality,
          effort: 6
        });
        break;
        
      case 'avif':
        image = image.avif({
          quality,
          effort: 4
        });
        break;
        
      default:
        image = image.jpeg({ quality, progressive });
    }
    
    return image;
  }

  /**
   * Convert template fit mode to Sharp fit mode
   * @param {string} templateFit - Template fit mode
   * @returns {string} Sharp fit mode
   */
  static getSharpFit(templateFit) {
    const fitMapping = {
      'cover': 'cover',
      'contain': 'contain',
      'fill': 'fill',
      'inside': 'inside',
      'outside': 'outside'
    };
    
    return fitMapping[templateFit] || 'cover';
  }

  /**
   * Calculate watermark position
   * @param {string} position - Watermark position
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {number} fontSize - Font size
   * @returns {object} Position coordinates
   */
  static getWatermarkPosition(position, width, height, fontSize) {
    const margin = fontSize * 0.5;
    
    const positions = {
      'top-left': {
        x: margin,
        y: fontSize + margin,
        anchor: 'start',
        baseline: 'hanging'
      },
      'top-right': {
        x: width - margin,
        y: fontSize + margin,
        anchor: 'end',
        baseline: 'hanging'
      },
      'bottom-left': {
        x: margin,
        y: height - margin,
        anchor: 'start',
        baseline: 'alphabetic'
      },
      'bottom-right': {
        x: width - margin,
        y: height - margin,
        anchor: 'end',
        baseline: 'alphabetic'
      },
      'center': {
        x: width / 2,
        y: height / 2,
        anchor: 'middle',
        baseline: 'central'
      }
    };
    
    return positions[position] || positions['bottom-right'];
  }

  /**
   * Get supported image formats
   * @returns {Array} Supported formats
   */
  static getSupportedFormats() {
    return ['jpeg', 'jpg', 'png', 'webp', 'avif', 'tiff', 'gif'];
  }

  /**
   * Validate image file
   * @param {string} filePath - Image file path
   * @returns {Promise<object>} Validation result
   */
  static async validateImage(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      
      if (!metadata.width || !metadata.height) {
        return { success: false, error: 'Invalid image file' };
      }
      
      return {
        success: true,
        data: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          channels: metadata.channels,
          hasAlpha: metadata.hasAlpha
        }
      };
    } catch (error) {
      return { success: false, error: 'Invalid image file' };
    }
  }

  /**
   * Generate image thumbnail
   * @param {string} inputPath - Input image path
   * @param {string} outputPath - Output thumbnail path
   * @param {number} size - Thumbnail size
   * @returns {Promise<object>} Generation result
   */
  static async generateThumbnail(inputPath, outputPath, size = 150) {
    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath);
        
      return { success: true };
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      return { success: false, error: error.message };
    }
  }
}
