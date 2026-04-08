// Rate Limiting Utility
// Prevents brute force attacks by limiting request frequency

import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  maxRequests: number;  // Maximum requests allowed
  windowMs: number;     // Time window in milliseconds
}

/**
 * Rate limit middleware for API routes
 * @param req - Next.js API request
 * @param res - Next.js API response
 * @param options - Rate limit configuration
 * @returns true if request is allowed, false if rate limited
 */
export function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  options: RateLimitOptions
): boolean {
  // Get client identifier (IP address)
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0].trim()
    : req.socket.remoteAddress || 'unknown';
  
  const key = `${ip}:${req.url}`;
  const now = Date.now();
  
  const record = rateLimitMap.get(key);
  
  // No record or window expired - allow and create new record
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return true;
  }
  
  // Rate limit exceeded
  if (record.count >= options.maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    res.status(429).json({ 
      message: 'Too many requests. Please try again later.',
      retryAfter,
    });
    return false;
  }
  
  // Increment counter and allow
  record.count++;
  return true;
}

/**
 * Clean up expired rate limit records
 * Runs periodically to prevent memory leaks
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Clean up every hour
setInterval(cleanupRateLimits, 60 * 60 * 1000);

// Export for testing
export { rateLimitMap };
