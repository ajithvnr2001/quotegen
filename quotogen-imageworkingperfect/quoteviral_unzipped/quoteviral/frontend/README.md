# QuoteViral Frontend

This is the frontend application for the QuoteViral platform, built with React, TypeScript, and Vite.

## Features

- Responsive design for all device sizes
- Real-time image editing with text overlay
- Template selection and preview
- Batch quote generation
- Platform-specific export options
- Health monitoring

## Technologies

- React with TypeScript
- Vite build system
- Tailwind CSS for styling
- Konva.js for canvas manipulation
- React Image Crop for image cropping

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This will start the development server on http://localhost:3000

### Building for Production

```bash
npm run build
```

This will create a production build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── TemplateSelector.tsx    # Template browsing interface
│   ├── BatchGenerator.tsx      # Batch generation interface
│   ├── HealthMonitor.tsx       # System health monitor
│   └── TextEditorPanel.tsx     # Advanced text editing panel
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Available Scripts

- `dev` - Start development server
- `build` - Build for production
- `preview` - Preview production build locally

## Configuration

The application can be configured through environment variables:

- `VITE_API_BASE` - Base URL for the API (default: https://api.quoteviral.online)

## Deployment

The frontend is designed to be deployed to Cloudflare Pages, but can be deployed to any static hosting service.

## Learn More

- [React Documentation](https://reactjs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)