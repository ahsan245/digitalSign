# Node.js Express App with Cloudinary Integration

A complete Node.js application built with Express.js, featuring Cloudinary integration for file uploads, CORS support, Joi validation middleware, and a well-structured project architecture.

## 🚀 Features

- **Express.js Server** - Fast and minimalist web framework
- **Cloudinary Integration** - Cloud-based image and video management
- **File Upload Support** - Single and multiple file uploads with Multer
- **Joi Validation** - Schema-based validation middleware
- **CORS Support** - Cross-Origin Resource Sharing enabled
- **Security Middleware** - Helmet for security headers
- **Request Logging** - Morgan for HTTP request logging
- **Environment Configuration** - dotenv for environment variables
- **Utility Functions** - Helper functions for common operations

## 📁 Project Structure

```
├── src/
│   ├── controllers/
│   │   └── uploadController.js    # Upload logic controllers
│   ├── middlewares/
│   │   ├── upload.js             # Multer file upload middleware
│   │   └── validation.js         # Joi validation middleware
│   ├── routes/
│   │   └── uploadRoutes.js       # Upload API routes
│   ├── services/
│   │   └── cloudinaryService.js  # Cloudinary service functions
│   ├── utils/
│   │   └── helpers.js            # Utility functions
│   └── index.js                  # Main application entry point
├── uploads/                      # Local upload directory (temporary)
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies and scripts
└── README.md                     # Project documentation
```

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd node-cloudinary-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your Cloudinary credentials:
   ```env
   NODE_ENV=development
   PORT=3000
   
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   UPLOAD_FOLDER=uploads
   MAX_FILE_SIZE=5242880
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Upload Routes (`/api/upload`)

#### Upload Single File
- **POST** `/api/upload/single`
- **Body:** FormData with `file` field
- **Optional Parameters:** `folder`, `quality`, `width`, `height`, `crop`

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('folder', 'uploads');
formData.append('quality', 'auto');

fetch('/api/upload/single', {
  method: 'POST',
  body: formData
});
```

#### Upload Multiple Files
- **POST** `/api/upload/multiple`
- **Body:** FormData with `files` field (max 10 files)

```javascript
const formData = new FormData();
for (let file of fileInput.files) {
  formData.append('files', file);
}

fetch('/api/upload/multiple', {
  method: 'POST',
  body: formData
});
```

#### Delete File
- **DELETE** `/api/upload/delete`
- **Body:** JSON with `publicId` and optional `resourceType`

```javascript
fetch('/api/upload/delete', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    publicId: 'uploads/image-123456',
    resourceType: 'image'
  })
});
```

#### Get Optimized URL
- **GET** `/api/upload/optimize/:publicId`
- **Query Parameters:** Any Cloudinary transformation parameters

#### Get Image Variants
- **GET** `/api/upload/variants/:publicId`
- Returns thumbnail, small, medium, large, and original variants

### Health Check
- **GET** `/health` - Server health status
- **GET** `/` - API information

## 🔧 Configuration

### Supported File Types
- **Images:** JPEG, PNG, GIF, WebP
- **Videos:** MP4, AVI, MOV

### File Size Limits
- Maximum file size: 5MB (configurable via `MAX_FILE_SIZE`)
- Maximum files per request: 10

### Validation Schemas

The application includes comprehensive Joi validation schemas for:
- File upload parameters
- User registration/login
- Pagination parameters
- ID parameter validation

## 🛡️ Security Features

- **Helmet** - Security headers
- **CORS** - Configurable cross-origin requests
- **File Type Validation** - Only allowed file types
- **File Size Limits** - Prevent large file uploads
- **Input Sanitization** - Joi schema validation

## 🎯 Cloudinary Features

- **Auto-optimization** - Automatic quality and format optimization
- **Image transformations** - Resize, crop, format conversion
- **Video support** - Video upload and processing
- **CDN delivery** - Fast global content delivery
- **Multiple variants** - Automatic generation of different sizes

## 🔄 Middleware Stack

1. **Security** - Helmet
2. **CORS** - Cross-origin resource sharing
3. **Logging** - Morgan HTTP logger
4. **Body Parsing** - Express JSON/URL-encoded
5. **File Upload** - Multer with validation
6. **Schema Validation** - Joi validation
7. **Error Handling** - Global error handler

## 📝 Usage Examples

### Basic File Upload (Frontend)

```html
<form id="uploadForm" enctype="multipart/form-data">
  <input type="file" name="file" id="fileInput" accept="image/*,video/*">
  <input type="text" name="folder" placeholder="Folder name (optional)">
  <button type="submit">Upload</button>
</form>

<script>
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('file', document.getElementById('fileInput').files[0]);
  formData.append('folder', e.target.folder.value || 'uploads');
  
  try {
    const response = await fetch('/api/upload/single', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    console.log('Upload result:', result);
  } catch (error) {
    console.error('Upload error:', error);
  }
});
</script>
```

## 🚀 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Adding New Routes

1. Create controller in `src/controllers/`
2. Add validation schemas in `src/middlewares/validation.js`
3. Create route file in `src/routes/`
4. Import and use in `src/index.js`

## 📊 Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

ISC License

## 🆘 Support

For support and questions, please open an issue in the repository.
