// Monitoring and analytics module
interface EventData {
  event: string;
  timestamp: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  country?: string;
  processingTime?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

// Track usage event
export async function trackUsage(env: any, eventData: EventData): Promise<void> {
  try {
    const timestamp = Date.now();
    const analyticsKey = `analytics:${eventData.event}:${timestamp}:${Math.random().toString(36).substring(7)}`;
    
    await env.QUOTE_CACHE.put(analyticsKey, JSON.stringify({
      ...eventData,
      timestamp: new Date().toISOString()
    }), {
      expirationTtl: 86400 * 30 // 30 days
    });
  } catch (error) {
    console.error('Failed to track usage:', error);
  }
}

// Log performance metrics
export async function logPerformance(
  env: any, 
  operation: string, 
  duration: number, 
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const timestamp = Date.now();
    const perfKey = `perf:${operation}:${timestamp}:${Math.random().toString(36).substring(7)}`;
    
    await env.QUOTE_CACHE.put(perfKey, JSON.stringify({
      operation,
      duration,
      metadata,
      timestamp: new Date().toISOString()
    }), {
      expirationTtl: 86400 * 7 // 7 days
    });
  } catch (error) {
    console.error('Failed to log performance:', error);
  }
}

// Log error
export async function logError(
  env: any, 
  error: Error, 
  context: Record<string, any> = {}
): Promise<void> {
  try {
    const timestamp = Date.now();
    const errorKey = `error:${timestamp}:${Math.random().toString(36).substring(7)}`;
    
    await env.QUOTE_CACHE.put(errorKey, JSON.stringify({
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    }), {
      expirationTtl: 86400 * 30 // 30 days
    });
  } catch (loggingError) {
    console.error('Failed to log error:', loggingError);
  }
}

// Get system health status
export async function getSystemHealth(env: any): Promise<any> {
  try {
    // Check all service dependencies
    const checks = await Promise.allSettled([
      env.UPLOADS.head('health-check.txt'),
      env.GENERATED.head('health-check.txt'),
      env.TEMPLATES.head('health-check.txt')
    ]);
    
    return {
      status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'degraded',
      services: {
        uploads: checks[0].status === 'fulfilled',
        generated: checks[1].status === 'fulfilled',
        templates: checks[2].status === 'fulfilled'
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Get usage statistics
export async function getUsageStats(env: any, hours: number = 24): Promise<any> {
  try {
    // This is a simplified implementation
    // In a real implementation, you would query the analytics data
    return {
      period: `${hours} hours`,
      totalRequests: 0,
      successfulRequests: 0,
      errorRate: 0,
      mostUsedFeatures: [],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}