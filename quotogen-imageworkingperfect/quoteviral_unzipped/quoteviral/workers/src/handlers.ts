import { QUOTES, FONTS, CATEGORIES, LANGUAGES } from './templates';
import { applyTextOverlay, TextOverlayConfig } from './textOverlay';
import { generateOutputVariants, getAvailableFormats } from './outputFormats';
import { validateImageUpload, validateTextInput, checkRateLimit } from './security';
import { trackUsage, logPerformance, logError, getSystemHealth } from './monitoring';

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

interface ImageManipulation {
  rotation: number;
  scale: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  dimensions: string;
  tags: string[];
  createdAt: string;
}

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Handle image serving requests
    if (url.pathname.startsWith('/serve/')) {
      // Import the serveImage module dynamically to avoid circular dependencies
      const { serveOptimizedImage } = await import('./serveImage');
      return await serveOptimizedImage(request, env);
    }
    
    switch (url.pathname) {
      case '/api/upload':
        if (request.method === 'POST') {
          return await handleImageUpload(request, env);
        }
        break;
      case '/api/generate':
        if (request.method === 'POST') {
          return await generateQuoteImage(request, env);
        }
        break;
      case '/api/categories':
        return new Response(JSON.stringify(CATEGORIES), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      case '/api/languages':
        return new Response(JSON.stringify(LANGUAGES), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      case '/api/quotes':
        const category = url.searchParams.get('category') || 'motivational';
        const language = url.searchParams.get('language') || 'en';
        const quotes = QUOTES[category]?.[language] || QUOTES['motivational']['en'];
        return new Response(JSON.stringify(quotes.map((text, index) => ({ 
          id: `${category}_${language}_${index}`, 
          text, 
          category, 
          language 
        }))), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      case '/api/fonts':
        return new Response(JSON.stringify(Object.entries(FONTS).map(([key, value]) => ({ 
          id: key, 
          ...value 
        }))), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      case '/api/templates':
        return await getTemplates(request, env);
      case '/api/batch':
        if (request.method === 'POST') {
          return await processBatchGeneration(request, env);
        }
        break;
      case '/api/health':
        return await getHealthStatus(env);
    }
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { 
      status: 500, 
      headers: corsHeaders 
    });
  }

  return new Response('Not found', { status: 404, headers: corsHeaders });
}

// Enhanced image upload handler with Cloudflare Images preprocessing and security validation
async function handleImageUpload(request: Request, env: Env): Promise<Response> {
  try {
    // Check rate limit
    const clientId = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimit = await checkRateLimit(clientId, 'upload', env.QUOTE_CACHE);
    
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ 
        error: rateLimit.error,
        resetTime: rateLimit.resetTime
      }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const userId = formData.get('userId') as string || 'anonymous';
    const category = formData.get('category') as string || 'general';
    
    // Validate image file
    const validation = validateImageUpload(imageFile);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Convert to ArrayBuffer for processing
    const imageBytes = await imageFile.arrayBuffer();
    const originalFileName = imageFile.name;
    const fileExtension = originalFileName.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Pre-process the image with Cloudflare Images
    let imageTransform = env.IMAGES.input(imageBytes);
    
    // Apply preprocessing based on use case
    imageTransform = imageTransform
      .rotate(0) // Auto-orient based on EXIF
      .resize({ 
        width: 2048, 
        height: 2048, 
        fit: 'cover' 
      }); // Standardize max dimensions
    
    // Apply category-specific optimizations
    if (category === 'portrait') {
      // Enhance for face detection
      imageTransform = imageTransform
        .sharpen(1.2)
        .brightness(1.05);
    } else if (category === 'landscape') {
      // Optimize for backgrounds
      imageTransform = imageTransform
        .contrast(1.1)
        .blur(0.5); // Slight blur for text overlay
    }
    
    // Generate multiple variants
    const variants = await generateImageVariants(imageTransform, {
      original: { format: 'png', quality: 100 },
      optimized: { format: 'webp', quality: 85 },
      thumbnail: { width: 300, height: 300, format: 'webp', quality: 75 },
      mobile: { width: 800, height: 800, format: 'webp', quality: 80 }
    });
    
    // Store all variants in R2
    const timestamp = Date.now();
    const baseFileName = `${userId}/${timestamp}_${originalFileName.split('.')[0]}`;
    const uploadPromises = [];
    
    for (const [variantName, variantData] of Object.entries(variants)) {
      const fileName = `${baseFileName}_${variantName}.${variantData.format}`;
      
      uploadPromises.push(
        env.UPLOADS.put(fileName, variantData.buffer, {
          httpMetadata: {
            contentType: `image/${variantData.format}`,
            cacheControl: 'public, max-age=31536000'
          },
          customMetadata: {
            userId: userId,
            category: category,
            variant: variantName,
            originalName: originalFileName,
            uploadedAt: new Date().toISOString(),
            dimensions: `${variantData.width}x${variantData.height}`,
            fileSize: variantData.buffer.byteLength.toString()
          }
        })
      );
    }
    
    await Promise.all(uploadPromises);
    
    return new Response(JSON.stringify({
      success: true,
      imageId: `${userId}/${timestamp}`,
      variants: Object.keys(variants).map(name => `${baseFileName}_${name}`),
      metadata: {
        originalSize: imageBytes.byteLength,
        processedSizes: Object.entries(variants).reduce((acc, [name, data]) => {
          acc[name] = data.buffer.byteLength;
          return acc;
        }, {} as Record<string, number>),
        category: category,
        uploadedAt: new Date().toISOString()
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    return new Response(JSON.stringify({ error: `Upload failed: ${error.message}` }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Generate multiple image variants
async function generateImageVariants(baseTransform: any, variantSpecs: Record<string, any>) {
  const variants: Record<string, any> = {};
  
  for (const [name, spec] of Object.entries(variantSpecs)) {
    let transform = baseTransform;
    
    // Apply variant-specific transformations
    if (spec.width || spec.height) {
      transform = transform.resize({
        width: spec.width,
        height: spec.height,
        fit: spec.fit || 'cover'
      });
    }
    
    // Apply filters if specified
    if (spec.blur) transform = transform.blur(spec.blur);
    if (spec.sharpen) transform = transform.sharpen(spec.sharpen);
    if (spec.brightness) transform = transform.brightness(spec.brightness);
    if (spec.contrast) transform = transform.contrast(spec.contrast);
    
    // Generate output
    const buffer = await transform.output({
      format: spec.format,
      quality: spec.quality || 85
    });
    
    variants[name] = {
      buffer: buffer,
      format: spec.format,
      width: spec.width,
      height: spec.height
    };
  }
  
  return variants;
}

// Enhanced quote generation with Cloudflare Images, multi-format output, and monitoring
async function generateQuoteImage(request: Request, env: Env): Promise<Response> {
  const startTime = Date.now();
  const clientId = request.headers.get('CF-Connecting-IP') || 'unknown';
  
  try {
    // Check rate limit
    const rateLimit = await checkRateLimit(clientId, 'generate', env.QUOTE_CACHE);
    
    if (!rateLimit.allowed) {
      await trackUsage(env, {
        event: 'quote_generation_rate_limited',
        userId: clientId,
        ip: clientId,
        userAgent: request.headers.get('User-Agent') || '',
        success: false,
        error: rateLimit.error,
        metadata: {
          resetTime: rateLimit.resetTime
        }
      });
      
      return new Response(JSON.stringify({ 
        error: rateLimit.error,
        resetTime: rateLimit.resetTime
      }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const data = await request.json();
    const { 
      imageId,
      quoteText, 
      fontId, 
      fontSize,
      fontColor,
      userId,
      imageManipulation,
      category = 'motivational',
      overlayStyle = 'gradient',
      backgroundColor = '#000000',
      textPosition = 'center',
      textAlignment = 'center',
      language = 'en',
      outputFormats = ['instagram-post', 'print-quality']
    } = data;

    // Validate text input
    const textValidation = validateTextInput(quoteText);
    if (!textValidation.valid) {
      await trackUsage(env, {
        event: 'quote_generation_invalid_input',
        userId: clientId,
        ip: clientId,
        userAgent: request.headers.get('User-Agent') || '',
        success: false,
        error: textValidation.error
      });
      
      return new Response(JSON.stringify({ error: textValidation.error }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const cacheKey = `image:${hashString(quoteText)}:${fontId}:${fontSize}:${category}:${overlayStyle}:${language}:${outputFormats.join(',')}`;
    
    const cached = await env.QUOTE_CACHE.get(cacheKey, 'arrayBuffer');
    if (cached && outputFormats.length === 1) {
      // Only return cached version for single format requests
      await trackUsage(env, {
        event: 'quote_generation_cache_hit',
        userId: clientId,
        ip: clientId,
        userAgent: request.headers.get('User-Agent') || '',
        success: true,
        metadata: {
          cacheKey,
          format: outputFormats[0]
        }
      });
      
      return new Response(cached, {
        headers: { 'Content-Type': 'image/jpeg' }
      });
    }

    // Load base image from R2
    const baseImagePath = `${imageId}_optimized.webp`;
    const baseImage = await env.UPLOADS.get(baseImagePath);
    
    if (!baseImage) {
      // Fallback to original if optimized version doesn't exist
      const originalImagePath = `${imageId}_original.png`;
      const originalImage = await env.UPLOADS.get(originalImagePath);
      
      if (!originalImage) {
        await trackUsage(env, {
          event: 'quote_generation_image_not_found',
          userId: clientId,
          ip: clientId,
          userAgent: request.headers.get('User-Agent') || '',
          success: false,
          error: 'Base image not found'
        });
        
        return new Response(JSON.stringify({ error: 'Base image not found' }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    const baseImageBytes = await baseImage.arrayBuffer();
    
    // Start image transformation pipeline with Cloudflare Images
    let finalImage = env.IMAGES.input(baseImageBytes);
    
    // Apply image manipulations
    if (imageManipulation) {
      if (imageManipulation.rotation) {
        finalImage = finalImage.rotate(imageManipulation.rotation);
      }
      
      if (imageManipulation.cropWidth && imageManipulation.cropHeight) {
        finalImage = finalImage.resize({
          width: imageManipulation.cropWidth,
          height: imageManipulation.cropHeight,
          fit: 'cover'
        });
      }
    }
    
    // Apply category-specific enhancements
    finalImage = await applyCategoryEnhancements(finalImage, category);
    
    // Apply background treatments
    finalImage = await applyBackgroundTreatment(finalImage, overlayStyle, backgroundColor);
    
    // Generate base image with Cloudflare Images
    const processedImageBuffer = await finalImage.output({ format: 'png', quality: 95 });
    
    // Apply advanced text overlay
    const fontConfig = FONTS[fontId] || FONTS['default'];
    const textOverlayConfig: TextOverlayConfig = {
      text: quoteText,
      fontFamily: fontConfig.family,
      fontSize: fontSize || fontConfig.size,
      fontWeight: fontConfig.weight || 'normal',
      fontStyle: 'normal',
      color: fontColor || fontConfig.color,
      alignment: textAlignment,
      position: textPosition,
      lineHeight: fontConfig.lineHeight || 60,
      shadow: {
        color: fontConfig.shadowColor || 'rgba(0,0,0,0.8)',
        blur: fontConfig.shadowBlur || 4,
        offsetX: 2,
        offsetY: 2
      },
      language: language
    };
    
    const finalImageBuffer = await applyTextOverlay(processedImageBuffer, textOverlayConfig);
    
    // Generate multiple output formats
    const outputVariants = await generateOutputVariants(finalImageBuffer, outputFormats, env);
    
    // Store generated images in R2
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const storagePromises = [];
    
    for (const [formatKey, variant] of Object.entries(outputVariants)) {
      const fileName = `${generationId}_${formatKey}.${variant.metadata.format}`;
      
      storagePromises.push(
        env.GENERATED.put(fileName, variant.buffer, {
          httpMetadata: {
            contentType: `image/${variant.metadata.format}`,
            cacheControl: 'public, max-age=86400'
          },
          customMetadata: {
            generationId: generationId,
            format: formatKey,
            quote: quoteText.substring(0, 100),
            category: category,
            language: language,
            createdAt: new Date().toISOString(),
            dimensions: `${variant.metadata.width}x${variant.metadata.height}`,
            optimizeFor: variant.metadata.optimizeFor
          }
        })
      );
    }
    
    await Promise.all(storagePromises);
    
    // Track successful usage
    const processingTime = Date.now() - startTime;
    await trackUsage(env, {
      event: 'quote_generated',
      userId: clientId,
      ip: clientId,
      userAgent: request.headers.get('User-Agent') || '',
      processingTime: processingTime,
      success: true,
      metadata: {
        generationId,
        category,
        language,
        formats: outputFormats,
        quoteLength: quoteText.length
      }
    });
    
    await logPerformance(env, 'quote_generation', processingTime, {
      category,
      language,
      formats: outputFormats.length
    });
    
    // For single format requests, return the image directly
    if (outputFormats.length === 1) {
      const formatKey = outputFormats[0];
      const variant = outputVariants[formatKey];
      
      if (variant) {
        await env.QUOTE_CACHE.put(cacheKey, variant.buffer, { expirationTtl: 86400 });
        
        return new Response(variant.buffer, {
          headers: { 
            'Content-Type': `image/${variant.metadata.format}`,
            'Content-Disposition': `inline; filename="${generationId}_${formatKey}.${variant.metadata.format}"`
          }
        });
      }
    }
    
    // For multiple formats, return JSON with URLs
    const variantUrls: Record<string, string> = {};
    for (const formatKey of outputFormats) {
      const format = getAvailableFormats()[formatKey];
      if (format) {
        variantUrls[formatKey] = `/serve/${generationId}_${formatKey}.${format.format}`;
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      generationId: generationId,
      variants: variantUrls,
      metadata: {
        quote: quoteText,
        category: category,
        language: language,
        createdAt: new Date().toISOString(),
        formats: outputFormats
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    
    // Log error
    await logError(env, error, {
      endpoint: 'generateQuoteImage',
      userId: clientId,
      processingTime: processingTime
    });
    
    // Track error usage
    await trackUsage(env, {
      event: 'quote_generation_failed',
      userId: clientId,
      ip: clientId,
      userAgent: request.headers.get('User-Agent') || '',
      processingTime: processingTime,
      success: false,
      error: error.message
    });
    
    return new Response(JSON.stringify({ error: `Generation failed: ${error.message}` }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Apply category-specific enhancements
async function applyCategoryEnhancements(imageTransform: any, category: string) {
  switch (category) {
    case 'motivational':
      // High contrast, vibrant colors
      return imageTransform
        .contrast(1.2)
        .brightness(1.1)
        .sharpen(1.1);
    
    case 'inspirational':
      // Soft, warm tones
      return imageTransform
        .brightness(1.05)
        .contrast(0.95)
        .gamma(1.1);
    
    case 'business':
      // Professional, clean look
      return imageTransform
        .contrast(1.1)
        .sharpen(1.2);
    
    case 'love':
      // Warm, soft filters
      return imageTransform
        .brightness(1.08)
        .contrast(0.9);
    
    case 'success':
      // Dynamic, high-impact
      return imageTransform
        .contrast(1.3)
        .brightness(1.05)
        .sharpen(1.3);
    
    case 'minimalist':
      // Clean, simple
      return imageTransform
        .contrast(0.9)
        .brightness(1.02);
    
    default:
      return imageTransform;
  }
}

// Apply background treatment
async function applyBackgroundTreatment(imageTransform: any, style: string, backgroundColor: string) {
  switch (style) {
    case 'blur':
      // Create blurred background
      return imageTransform
        .blur(10)
        .brightness(0.8);
    
    case 'gradient':
      // For gradient overlay, we'll handle this in the canvas processing
      return imageTransform;
    
    case 'solid':
      // For solid overlay, we'll handle this in the canvas processing
      return imageTransform;
    
    default:
      return imageTransform;
  }
}

// Original canvas-based image processing with text overlay
async function processImageWithQuoteAndManipulation(
  imageBuffer: Uint8Array, 
  quote: string, 
  fontConfig: any,
  manipulation: ImageManipulation
): Promise<Blob> {
  const canvas = new OffscreenCanvas(1080, 1080);
  const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

  // Load original image
  const img = await createImageBitmap(new Blob([imageBuffer]));
  
  // Draw image
  ctx.drawImage(img, 0, 0, 1080, 1080);

  // Add overlay based on style
  if (fontConfig.overlayStyle === 'gradient' || !fontConfig.overlayStyle) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);
  } else if (fontConfig.overlayStyle === 'solid') {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, 1080, 1080);
  }

  // Text styling with custom size and color
  ctx.font = `${fontConfig.weight || 'normal'} ${fontConfig.size}px ${fontConfig.family}`;
  ctx.fillStyle = fontConfig.color;
  ctx.textAlign = 'center';
  ctx.shadowColor = fontConfig.shadowColor || 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = fontConfig.shadowBlur || 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  // Smart text wrapping
  const lines = wrapText(ctx, quote, 900);
  const totalHeight = lines.length * fontConfig.lineHeight;
  const startY = (1080 - totalHeight) / 2 + fontConfig.size;

  lines.forEach((line, index) => {
    ctx.fillText(line, 540, startY + index * fontConfig.lineHeight);
  });

  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
}

function wrapText(ctx: OffscreenCanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Template management system
async function getTemplates(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || 'all';
  const language = url.searchParams.get('language') || 'en';
  
  // List templates from R2 bucket
  const templatesList = await env.TEMPLATES.list({
    prefix: category === 'all' ? '' : `${category}/`
  });
  
  const templates: Template[] = await Promise.all(
    templatesList.objects.slice(0, 50).map(async (obj) => {
      const metadata = obj.customMetadata || {};
      
      return {
        id: obj.key,
        name: metadata.name || obj.key,
        category: metadata.category || 'general',
        language: metadata.language || 'en',
        dimensions: metadata.dimensions || '1200x800',
        tags: metadata.tags ? metadata.tags.split(',') : [],
        createdAt: obj.uploaded?.toISOString() || new Date().toISOString()
      };
    })
  );
  
  // Filter by language if specified
  const filteredTemplates = language === 'all' 
    ? templates 
    : templates.filter(t => t.language === language);
  
  return new Response(JSON.stringify({
    templates: filteredTemplates,
    total: filteredTemplates.length,
    category: category,
    language: language
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Batch processing system with security validation
async function processBatchGeneration(request: Request, env: Env): Promise<Response> {
  try {
    // Check rate limit
    const clientId = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimit = await checkRateLimit(clientId, 'batch', env.QUOTE_CACHE);
    
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ 
        error: rateLimit.error,
        resetTime: rateLimit.resetTime
      }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { images, quotes, settings } = await request.json();
    
    // Validate inputs
    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: 'No images provided' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!quotes || !Array.isArray(quotes) || quotes.length === 0) {
      return new Response(JSON.stringify({ error: 'No quotes provided' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate each quote
    for (const quote of quotes) {
      if (typeof quote === 'string') {
        const validation = validateTextInput(quote);
        if (!validation.valid) {
          return new Response(JSON.stringify({ error: validation.error }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } else if (typeof quote === 'object' && quote.text) {
        const validation = validateTextInput(quote.text);
        if (!validation.valid) {
          return new Response(JSON.stringify({ error: validation.error }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } else {
        return new Response(JSON.stringify({ error: 'Invalid quote format' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const results = await Promise.allSettled(
      quotes.map(async (quote: any, index: number) => {
        const imageId = images[index % images.length];
        
        // Create a mock request for generateQuoteImage
        const mockRequest = {
          json: async () => ({
            imageId: imageId,
            quoteText: typeof quote === 'string' ? quote : quote.text,
            ...settings
          })
        } as unknown as Request;
        
        try {
          const response = await generateQuoteImage(mockRequest, env);
          const arrayBuffer = await response.arrayBuffer();
          
          return {
            index: index,
            status: 'fulfilled',
            data: {
              imageId: `gen_${Date.now()}_${index}`,
              size: arrayBuffer.byteLength
            },
            error: null
          };
        } catch (error: any) {
          return {
            index: index,
            status: 'rejected',
            data: null,
            error: error.message
          };
        }
      })
    );
    
    const successful = results.filter((r: any) => r.status === 'fulfilled').length;
    const failed = results.filter((r: any) => r.status === 'rejected').length;
    
    return new Response(JSON.stringify({
      batchId: batchId,
      total: quotes.length,
      successful: successful,
      failed: failed,
      results: results
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: `Batch processing failed: ${error.message}` }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Health status monitoring
async function getHealthStatus(env: Env): Promise<Response> {
  try {
    const health = await getSystemHealth(env);
    return new Response(JSON.stringify(health), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function hashImage(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}