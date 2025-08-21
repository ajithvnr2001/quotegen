import { parseClientCapabilities, optimizeImageForClient, generateImageETag, isCached, getContentType } from './imageServing';

interface Env {
  DOMAIN: string;
  QUOTE_CACHE: KVNamespace;
  ASSETS_BUCKET: R2Bucket;
  UPLOADS: R2Bucket;
  GENERATED: R2Bucket;
  TEMPLATES: R2Bucket;
  IMAGES: any; // Cloudflare Images binding
  DB: D1Database;
}

// Smart image serving endpoint
export async function serveOptimizedImage(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const imagePath = url.pathname.replace('/serve/', '');
    
    // Parse client capabilities
    const client = parseClientCapabilities(request);
    
    // Try to get the requested image from R2
    let image = await env.GENERATED.get(imagePath);
    
    if (!image) {
      // Try templates bucket as fallback
      image = await env.TEMPLATES.get(imagePath);
      
      if (!image) {
        return new Response('Image not found', { status: 404 });
      }
    }
    
    // Generate ETag for the image
    const imageBytes = await image.arrayBuffer();
    const etag = await generateImageETag(imageBytes);
    
    // Check if client has cached version
    if (isCached(request, etag)) {
      return new Response(null, { 
        status: 304, // Not Modified
        headers: {
          'ETag': etag,
          'Cache-Control': 'public, max-age=31536000'
        }
      });
    }
    
    // Optimize image for client capabilities
    const optimizedImage = await optimizeImageForClient(imageBytes, env, client);
    const optimizedBuffer = await optimizedImage;
    
    // Get content type
    const contentType = image.httpMetadata?.contentType || getContentType('jpeg');
    
    return new Response(optimizedBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'ETag': etag,
        'Vary': 'Accept, User-Agent, DPR, Save-Data',
        'X-Optimized': 'true'
      }
    });
  } catch (error: any) {
    return new Response(`Image serving failed: ${error.message}`, { 
      status: 500 
    });
  }
}