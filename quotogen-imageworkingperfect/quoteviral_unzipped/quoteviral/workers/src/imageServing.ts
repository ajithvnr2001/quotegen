// Smart image serving with optimization based on client capabilities
interface ClientCapabilities {
  supportsWebP: boolean;
  supportsAVIF: boolean;
  isMobile: boolean;
  devicePixelRatio: number;
  saveData: boolean;
  acceptHeader: string;
  userAgent: string;
}

interface OptimizationContext {
  format: 'jpeg' | 'png' | 'webp' | 'avif';
  quality: number;
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  sharpen?: number;
  blur?: number;
}

// Parse client capabilities from request headers
export function parseClientCapabilities(request: Request): ClientCapabilities {
  const accept = request.headers.get('Accept') || '';
  const userAgent = request.headers.get('User-Agent') || '';
  const dpr = parseFloat(request.headers.get('DPR') || '1');
  const saveData = request.headers.get('Save-Data') === 'on';
  
  return {
    supportsWebP: accept.includes('image/webp'),
    supportsAVIF: accept.includes('image/avif'),
    isMobile: /Mobile|Android|iPhone/.test(userAgent),
    devicePixelRatio: dpr,
    saveData: saveData,
    acceptHeader: accept,
    userAgent: userAgent
  };
}

// Determine optimal serving strategy based on client capabilities
export function determineOptimizationStrategy(
  imagePath: string,
  client: ClientCapabilities
): OptimizationContext {
  // Parse image metadata from path if available
  const pathParts = imagePath.split('/');
  const filename = pathParts[pathParts.length - 1];
  const [name, ext] = filename.split('.');
  
  // Check if image is already in optimal format
  if (ext === 'avif' && client.supportsAVIF) {
    return { format: 'avif', quality: 80 };
  }
  
  if (ext === 'webp' && client.supportsWebP) {
    return { format: 'webp', quality: 80 };
  }
  
  // Choose optimal format based on client capabilities
  let format: 'jpeg' | 'png' | 'webp' | 'avif' = 'jpeg';
  let quality = 80;
  
  if (client.supportsAVIF && !client.saveData) {
    format = 'avif';
    quality = client.saveData ? 60 : 80;
  } else if (client.supportsWebP) {
    format = 'webp';
    quality = client.saveData ? 65 : 80;
  } else if (ext === 'png') {
    format = 'png';
    quality = 90;
  }
  
  // Adjust quality for save-data mode
  if (client.saveData) {
    quality = Math.max(30, quality - 20);
  }
  
  // Mobile-specific optimizations
  const context: OptimizationContext = {
    format,
    quality
  };
  
  // Apply device pixel ratio adjustments for high-DPI displays
  if (client.isMobile && client.devicePixelRatio > 1) {
    context.sharpen = 1.2;
  }
  
  return context;
}

// Optimize image using Cloudflare Images based on client capabilities
export async function optimizeImageForClient(
  imageBuffer: ArrayBuffer,
  env: any,
  client: ClientCapabilities
): Promise<ArrayBuffer> {
  const optimization = determineOptimizationStrategy('', client);
  
  // Create Cloudflare Images transformation
  let transform = env.IMAGES.input(imageBuffer);
  
  // Apply format and quality optimizations
  transform = transform.output({
    format: optimization.format,
    quality: optimization.quality
  });
  
  // Apply additional optimizations
  if (optimization.sharpen) {
    transform = transform.sharpen(optimization.sharpen);
  }
  
  if (optimization.blur) {
    transform = transform.blur(optimization.blur);
  }
  
  return await transform;
}

// Generate ETag for image content
export async function generateImageETag(imageBuffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', imageBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return `"${hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)}"`;
}

// Check if client has cached version using ETag
export function isCached(request: Request, etag: string): boolean {
  const ifNoneMatch = request.headers.get('If-None-Match');
  return ifNoneMatch === etag;
}

// Get content type based on format
export function getContentType(format: string): string {
  switch (format) {
    case 'webp': return 'image/webp';
    case 'avif': return 'image/avif';
    case 'png': return 'image/png';
    default: return 'image/jpeg';
  }
}