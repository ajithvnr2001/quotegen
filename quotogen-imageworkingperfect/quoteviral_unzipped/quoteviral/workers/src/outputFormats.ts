// Multi-format output generation for different social media platforms
interface OutputFormat {
  name: string;
  width: number;
  height: number;
  format: 'jpeg' | 'png' | 'webp';
  quality: number;
  optimizeFor: string;
  fileNameSuffix: string;
}

// Platform-specific output formats
const OUTPUT_FORMATS: Record<string, OutputFormat> = {
  'instagram-post': {
    name: 'Instagram Post',
    width: 1080,
    height: 1080,
    format: 'jpeg',
    quality: 90,
    optimizeFor: 'social-media',
    fileNameSuffix: 'instagram-post'
  },
  'instagram-story': {
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
    format: 'jpeg',
    quality: 85,
    optimizeFor: 'story',
    fileNameSuffix: 'instagram-story'
  },
  'facebook-post': {
    name: 'Facebook Post',
    width: 1200,
    height: 630,
    format: 'jpeg',
    quality: 90,
    optimizeFor: 'social-media',
    fileNameSuffix: 'facebook-post'
  },
  'twitter-post': {
    name: 'Twitter Post',
    width: 1200,
    height: 675,
    format: 'jpeg',
    quality: 90,
    optimizeFor: 'social-media',
    fileNameSuffix: 'twitter-post'
  },
  'linkedin-post': {
    name: 'LinkedIn Post',
    width: 1200,
    height: 627,
    format: 'jpeg',
    quality: 85,
    optimizeFor: 'professional',
    fileNameSuffix: 'linkedin-post'
  },
  'print-quality': {
    name: 'Print Quality',
    width: 2048,
    height: 2048,
    format: 'png',
    quality: 100,
    optimizeFor: 'print',
    fileNameSuffix: 'print'
  }
};

// Generate multiple output formats from a single image
export async function generateOutputVariants(
  imageBuffer: ArrayBuffer,
  formats: string[],
  env: any
): Promise<Record<string, { buffer: ArrayBuffer; metadata: any }>> {
  const variants: Record<string, { buffer: ArrayBuffer; metadata: any }> = {};
  
  for (const formatKey of formats) {
    const format = OUTPUT_FORMATS[formatKey];
    if (!format) continue;
    
    // Create Cloudflare Images transformation
    let transform = env.IMAGES.input(imageBuffer);
    
    // Apply platform-specific optimizations
    switch (format.optimizeFor) {
      case 'social-media':
        transform = transform
          .resize({ width: format.width, height: format.height, fit: 'cover' })
          .sharpen(1.1);
        break;
        
      case 'story':
        transform = transform
          .resize({ width: format.width, height: format.height, fit: 'cover' })
          .contrast(1.1)
          .brightness(1.02);
        break;
        
      case 'professional':
        transform = transform
          .resize({ width: format.width, height: format.height, fit: 'cover' })
          .contrast(1.1)
          .sharpen(1.2);
        break;
        
      case 'print':
        transform = transform
          .resize({ width: format.width, height: format.height, fit: 'contain' });
        break;
    }
    
    // Generate output
    const buffer = await transform.output({
      format: format.format,
      quality: format.quality
    });
    
    variants[formatKey] = {
      buffer: buffer,
      metadata: {
        format: format.format,
        width: format.width,
        height: format.height,
        optimizeFor: format.optimizeFor,
        quality: format.quality
      }
    };
  }
  
  return variants;
}

// Get all available output formats
export function getAvailableFormats(): Record<string, OutputFormat> {
  return OUTPUT_FORMATS;
}

// Get specific format by key
export function getFormat(formatKey: string): OutputFormat | undefined {
  return OUTPUT_FORMATS[formatKey];
}

// Generate filename for a specific format
export function generateFileName(baseName: string, formatKey: string): string {
  const format = OUTPUT_FORMATS[formatKey];
  if (!format) return `${baseName}.jpg`;
  
  const extension = format.format === 'png' ? 'png' : format.format === 'webp' ? 'webp' : 'jpg';
  return `${baseName}_${format.fileNameSuffix}.${extension}`;
}