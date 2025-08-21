// Smart caching system with multi-tier cache strategy
interface CacheStrategy {
  tier: 'browser' | 'cdn' | 'origin';
  maxAge: number;
  staleWhileRevalidate?: number;
  vary?: string[];
}

// Cache strategies for different content types
const CACHE_STRATEGIES: Record<string, CacheStrategy[]> = {
  templates: [
    { tier: 'browser', maxAge: 3600 }, // 1 hour
    { tier: 'cdn', maxAge: 86400 },    // 24 hours
    { tier: 'origin', maxAge: 2592000 } // 30 days
  ],
  generated: [
    { tier: 'browser', maxAge: 300 },  // 5 minutes
    { tier: 'cdn', maxAge: 3600 },     // 1 hour
    { tier: 'origin', maxAge: 86400 }  // 24 hours
  ],
  uploads: [
    { tier: 'browser', maxAge: 3600 }, // 1 hour
    { tier: 'cdn', maxAge: 86400 },    // 24 hours
    { tier: 'origin', maxAge: 31536000 } // 1 year
  ],
  fonts: [
    { tier: 'browser', maxAge: 31536000 }, // 1 year
    { tier: 'cdn', maxAge: 31536000 },     // 1 year
    { tier: 'origin', maxAge: 31536000 }   // 1 year
  ]
};

// Generate cache headers for a specific content type and tier
export function getCacheHeaders(contentType: string, tier: 'browser' | 'cdn' | 'origin' = 'browser'): Headers {
  const strategy = CACHE_STRATEGIES[contentType]?.find(s => s.tier === tier);
  
  if (!strategy) {
    return new Headers({
      'Cache-Control': 'no-cache',
      'Vary': 'Accept, User-Agent'
    });
  }
  
  const cacheControl = `public, max-age=${strategy.maxAge}` + 
    (strategy.staleWhileRevalidate ? `, stale-while-revalidate=${strategy.staleWhileRevalidate}` : '');
  
  const headers: Record<string, string> = {
    'Cache-Control': cacheControl,
    'Vary': strategy.vary?.join(', ') || 'Accept, User-Agent'
  };
  
  return new Headers(headers);
}

// Generate ETag for content
export async function generateETag(content: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', content);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return `"${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}"`;
}

// Check if content has changed using ETag
export async function hasContentChanged(content: ArrayBuffer, etag: string): Promise<boolean> {
  const currentETag = await generateETag(content);
  return currentETag !== etag;
}

// Cache preloading for critical assets
export async function preloadCriticalAssets(env: any): Promise<void> {
  const criticalAssets = [
    'fonts/Inter-Bold.woff2',
    'overlays/gradient.png',
    'templates/default.jpg'
  ];
  
  try {
    // Note: This is a simplified implementation
    // In a real implementation, you would use the Cache API
    console.log('Preloading critical assets:', criticalAssets);
  } catch (error) {
    console.error('Failed to preload critical assets:', error);
  }
}

// Get all available cache strategies
export function getCacheStrategies(): Record<string, CacheStrategy[]> {
  return CACHE_STRATEGIES;
}

// Get specific cache strategy
export function getCacheStrategy(contentType: string): CacheStrategy[] | undefined {
  return CACHE_STRATEGIES[contentType];
}