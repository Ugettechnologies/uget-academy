import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function checkRateLimit(ip: string, action: string = 'auth') {
  // Fallback for development if Upstash Redis credentials are not configured yet
  if (!redis) {
    return { success: true, limit: 10, remaining: 10, reset: Date.now() + 60000 };
  }

  const limiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 requests per minute
    prefix: `ratelimit:${action}`,
  });

  try {
    const result = await limiter.limit(ip);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Graceful degradation: allow request if rate limiter fails
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}
