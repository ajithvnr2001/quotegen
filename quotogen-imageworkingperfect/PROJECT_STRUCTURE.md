# QuoteViral Project Structure

## Root Directory
```
quoteviral/
├── frontend/              # React frontend application
├── workers/               # Cloudflare Workers backend
├── public/                # Public assets
│   ├── templates/         # Template assets
│   ├── fonts/             # Font files
│   ├── overlays/          # Overlay images
│   └── frames/            # Frame images
├── documentation/         # Project documentation
└── scripts/               # Deployment and utility scripts
```

## Frontend Directory
```
frontend/
├── src/                   # Source code
│   ├── App.tsx            # Main application component
│   ├── TextEditorPanel.tsx # Text editing component
│   ├── TemplateSelector.tsx # Template selection component
│   ├── BatchGenerator.tsx  # Batch generation component
│   ├── HealthMonitor.tsx   # Health monitoring component
│   ├── imageProcessor.worker.ts # Web worker for image processing
│   └── ...                 # Other components and utilities
├── public/                # Static assets
│   ├── templates/         # Template preview images and metadata
│   ├── fonts/             # Font files
│   ├── overlays/          # Overlay images
│   ├── frames/            # Frame images
│   ├── sw.js              # Service worker
│   └── health-check.txt   # Health check file
├── package.json           # NPM dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # Frontend documentation
```

## Workers Directory
```
workers/
├── src/                   # Source code
│   ├── index.ts           # Worker entry point
│   ├── handlers.ts        # API endpoint handlers
│   ├── templates.ts        # Quote database and templates
│   ├── textOverlay.ts      # Text overlay system
│   ├── outputFormats.ts    # Multi-format generation
│   ├── cache.ts            # Caching strategies
│   ├── security.ts         # Security validation
│   ├── monitoring.ts       # Usage tracking and analytics
│   ├── imageServing.ts     # Image serving optimizations
│   └── serveImage.ts       # Image serving endpoint
├── wrangler.toml          # Worker configuration
├── package.json           # NPM dependencies and scripts
└── README.md             # Workers documentation
```

## Documentation Directory
```
documentation/
├── IMPLEMENTATION_SUMMARY.md     # Complete implementation overview
├── deployment_plan.md            # Deployment guide
├── deployment_checklist.md       # Deployment checklist
├── deployment_troubleshooting.md # Troubleshooting guide
├── deployment_failures.md        # Deployment failures and resolutions
├── errorandrectified.md          # Development errors and solutions
├── migration_proposal.md         # Original enhancement proposal
├── Completed Implementation and pending.md # Implementation progress
└── deployment_summary.md         # Deployment documentation suite
```

## Scripts Directory
```
scripts/
├── deploy_all.sh          # Complete deployment script (Linux/Mac)
├── deploy_all.bat         # Complete deployment script (Windows)
├── upload_assets.sh       # Asset upload script (Linux/Mac)
├── upload_assets.bat      # Asset upload script (Windows)
├── test_api.sh            # API testing script (Linux/Mac)
└── test_api.bat           # API testing script (Windows)
```

## Public Assets Directory
```
public/
├── templates/             # Template assets
│   ├── *.json             # Template metadata files
│   └── *.jpg              # Template preview images
├── fonts/                 # Font files
│   └── README.md          # Font assets documentation
├── overlays/              # Overlay images
│   └── README.md          # Overlay assets documentation
├── frames/                # Frame images
│   └── README.md          # Frame assets documentation
├── sw.js                  # Service worker
└── health-check.txt       # Health check file
```

## Key Files

### Configuration Files
- `frontend/vite.config.ts` - Frontend build configuration
- `workers/wrangler.toml` - Worker deployment configuration
- `frontend/tsconfig.json` - Frontend TypeScript configuration
- `workers/tsconfig.json` - Worker TypeScript configuration

### Documentation Files
- `README.md` - Main project documentation
- `frontend/README.md` - Frontend documentation
- `workers/README.md` - Workers documentation
- `IMPLEMENTATION_SUMMARY.md` - Complete implementation overview

### Script Files
- `deploy_all.sh` / `deploy_all.bat` - Complete deployment automation
- `upload_assets.sh` / `upload_assets.bat` - Asset upload automation
- `test_api.sh` / `test_api.bat` - API testing automation

## Asset Organization

### Templates
- Stored in `public/templates/`
- Each template has a JSON metadata file and preview image
- Organized by category (motivational, aesthetic, business, memes, inspirational)

### Fonts
- Stored in `public/fonts/`
- Web-optimized font files (WOFF2 format)
- Multiple font families for variety

### Overlays
- Stored in `public/overlays/`
- Gradient and texture overlays for text readability
- PNG format for transparency support

### Frames
- Stored in `public/frames/`
- Decorative borders and frames
- PNG format for transparency support

This structure provides a clean, organized, and maintainable codebase for the QuoteViral platform.