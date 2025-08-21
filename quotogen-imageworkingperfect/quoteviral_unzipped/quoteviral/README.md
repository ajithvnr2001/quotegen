# QuoteViral Platform

QuoteViral is a comprehensive platform for creating viral quote images with advanced features including template management, batch processing, multi-language support, and platform-specific exports. The platform leverages Cloudflare's powerful infrastructure for optimal performance and scalability.

## Features

### Core Features
- Advanced image processing with Cloudflare Images
- Template management system with preview functionality
- Batch quote generation for bulk processing
- Multi-language support (English, Spanish, French, Hindi, German, Portuguese, Italian, Japanese)
- Platform-specific exports (Instagram, Facebook, Twitter, LinkedIn, Print quality)
- Smart caching for optimal performance
- Comprehensive security features

### Advanced Features
- Category-specific image enhancements
- Background treatment options (blur, gradient, solid overlays)
- Advanced text overlay system with styling options
- Multi-format output generation
- Rate limiting and input validation
- Usage tracking and analytics
- Health monitoring

## Architecture

### Frontend
- React with TypeScript
- Vite build system
- Tailwind CSS for styling
- Responsive design for all devices

### Backend
- Cloudflare Workers for serverless API
- Cloudflare R2 for asset storage
- Cloudflare D1 for database
- Cloudflare KV for caching
- Cloudflare Images for image processing

## Project Structure

```
quoteviral/
├── frontend/              # React frontend application
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   └── ...            # Other source files
│   └── public/            # Static assets
│       ├── templates/     # Template preview images
│       ├── fonts/         # Font files
│       ├── overlays/      # Overlay images
│       └── frames/        # Frame images
├── workers/               # Cloudflare Workers backend
│   └── src/               # Worker source code
└── documentation/         # Deployment and implementation docs
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Cloudflare account with Workers Paid plan
- Wrangler CLI (`npm install -g wrangler`)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd quoteviral
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../workers
   npm install
   ```

### Development

#### Frontend Development
```bash
cd frontend
npm run dev
```

#### Backend Development
```bash
cd workers
wrangler dev
```

### Deployment

1. Configure Cloudflare credentials:
   ```bash
   wrangler login
   ```

2. Deploy backend:
   ```bash
   cd workers
   wrangler deploy
   ```

3. Deploy frontend:
   ```bash
   cd frontend
   npm run build
   wrangler pages deploy dist
   ```

4. Upload assets:
   ```bash
   # Use the provided scripts
   ./upload_assets.sh  # Linux/Mac
   upload_assets.bat   # Windows
   ```

5. Configure custom domains in Cloudflare dashboard

## API Endpoints

### Image Management
- `POST /api/upload` - Upload and preprocess images
- `POST /api/generate` - Generate quote images with text overlay
- `GET /serve/{imageId}` - Serve optimized images

### Content Management
- `GET /api/categories` - Get available quote categories
- `GET /api/languages` - Get supported languages
- `GET /api/quotes` - Get quotes by category and language
- `GET /api/fonts` - Get available font configurations
- `GET /api/templates` - Get template library

### Batch Processing
- `POST /api/batch` - Generate multiple quotes in batch

### System Monitoring
- `GET /api/health` - Get system health status

## Documentation

Complete documentation is available in the `documentation/` directory:

- `IMPLEMENTATION_SUMMARY.md` - Complete implementation overview
- `deployment_plan.md` - Step-by-step deployment guide
- `deployment_checklist.md` - Detailed deployment checklist
- `deployment_troubleshooting.md` - Troubleshooting guide
- `errorandrectified.md` - Development errors and solutions

## Scripts

- `upload_assets.sh` / `upload_assets.bat` - Asset upload scripts
- `test_api.sh` / `test_api.bat` - API testing scripts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is proprietary and confidential. All rights reserved.

## Support

For issues and support, please contact the development team.