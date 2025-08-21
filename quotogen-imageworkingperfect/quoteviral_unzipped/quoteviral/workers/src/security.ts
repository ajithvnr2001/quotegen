// Security module with input validation and rate limiting
interface RateLimitConfig {
  requests: number;
  window: number; // in seconds
  banDuration?: number; // in seconds
}

// Rate limit configuration
const RATE_LIMIT_CONFIG: Record<string, RateLimitConfig> = {
  default: { requests: 100, window: 3600 }, // 100 requests per hour
  upload: { requests: 10, window: 3600 },   // 10 uploads per hour
  generate: { requests: 50, window: 3600 }, // 50 generations per hour
  batch: { requests: 5, window: 3600 }      // 5 batches per hour
};

// Validate image upload
export function validateImageUpload(file: any, maxSize: number = 10485760): { valid: boolean; error?: string } {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  // Check file size
  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type. Allowed types: JPEG, PNG, WebP, GIF' };
  }
  
  // Sanitize filename
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return { valid: true, error: undefined };
}

// Validate text input
export function validateTextInput(text: string, maxLength: number = 500): { valid: boolean; error?: string; sanitized?: string } {
  // Check if text exists
  if (!text) {
    return { valid: false, error: 'No text provided' };
  }
  
  // Check text length
  if (text.length > maxLength) {
    return { valid: false, error: `Text too long. Maximum length is ${maxLength} characters` };
  }
  
  // Remove potentially harmful content
  const sanitized = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '')   // Remove vbscript: protocol
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/on\w+='[^']*'/gi, '')  // Remove event handlers
    .trim();
  
  return { valid: true, error: undefined, sanitized };
}

// Check rate limit for a client
export async function checkRateLimit(
  clientId: string, 
  action: string, 
  kv: any
): Promise<{ allowed: boolean; error?: string; resetTime?: number }> {
  try {
    const config = RATE_LIMIT_CONFIG[action] || RATE_LIMIT_CONFIG.default;
    const key = `ratelimit:${action}:${clientId}`;
    
    // Get current count and reset time
    const current = await kv.get(key);
    const resetKey = `ratelimit:reset:${action}:${clientId}`;
    const resetTime = await kv.get(resetKey);
    
    const now = Math.floor(Date.now() / 1000);
    
    // If reset time has passed, reset the counter
    if (!resetTime || now >= parseInt(resetTime)) {
      await kv.put(key, '1', { expirationTtl: config.window });
      await kv.put(resetKey, (now + config.window).toString(), { expirationTtl: config.window });
      return { allowed: true };
    }
    
    // Check if limit has been reached
    const count = current ? parseInt(current) : 0;
    if (count >= config.requests) {
      return { 
        allowed: false, 
        error: `Rate limit exceeded. Try again in ${Math.ceil((parseInt(resetTime) - now) / 60)} minutes`,
        resetTime: parseInt(resetTime)
      };
    }
    
    // Increment counter
    await kv.put(key, (count + 1).toString(), { expirationTtl: config.window });
    
    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow request if rate limiting fails
    return { allowed: true };
  }
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 100); // Limit to 100 characters
}

// Validate and sanitize URL
export function validateUrl(url: string): { valid: boolean; error?: string; sanitized?: string } {
  try {
    const parsed = new URL(url);
    
    // Only allow HTTP and HTTPS protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Invalid protocol. Only HTTP and HTTPS are allowed' };
    }
    
    // Basic domain validation
    if (!parsed.hostname || parsed.hostname.length > 253) {
      return { valid: false, error: 'Invalid domain' };
    }
    
    return { valid: true, sanitized: parsed.toString() };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

// Get rate limit configuration
export function getRateLimitConfig(): Record<string, RateLimitConfig> {
  return RATE_LIMIT_CONFIG;
}