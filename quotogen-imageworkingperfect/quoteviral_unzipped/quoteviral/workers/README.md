# QuoteViral Workers Backend

This is the backend API for the QuoteViral platform, built with Cloudflare Workers.

## Features

- Serverless API endpoints
- Cloudflare Images integration for advanced image processing
- R2 storage for assets and generated images
- D1 database for usage tracking
- KV caching for performance optimization
- Rate limiting and security features

## Technologies

- Cloudflare Workers
- TypeScript
- Cloudflare Images API
- Cloudflare R2 (Object Storage)
- Cloudflare D1 (Database)
- Cloudflare KV (Key-Value Store)

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

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account with Workers Paid plan

### Installation

```bash
npm install
```

### Development

```bash
wrangler dev
```

This will start the development server locally.

### Deployment

```bash
wrangler deploy
```

This will deploy the worker to Cloudflare.

## Configuration

The worker is configured through `wrangler.toml`:

- R2 bucket bindings for asset storage
- D1 database binding
- KV namespace binding
- Images binding for image processing

## Project Structure

```
src/
├── handlers.ts         # API endpoint handlers
├── templates.ts        # Quote database and template definitions
├── textOverlay.ts      # Advanced text rendering system
├── outputFormats.ts    # Multi-format generation
├── cache.ts            # Smart caching strategies
├── security.ts         # Input validation and rate limiting
├── monitoring.ts       # Usage tracking and analytics
├── imageServing.ts     # Smart image optimization
└── serveImage.ts       # Image serving endpoint
```

## Environment Variables

The worker uses the following environment variables defined in `wrangler.toml`:

- `DOMAIN` - The domain for the API
- Various bindings for Cloudflare services

## Learn More

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Images Documentation](https://developers.cloudflare.com/images/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)