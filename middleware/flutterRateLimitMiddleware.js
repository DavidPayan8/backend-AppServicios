/**
 * Rate limiting middleware specifically for Flutter app
 * Tracks requests per codigo_usuario to prevent abuse
 */

class RateLimiter {
  constructor(windowMs = 15 * 60 * 1000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map(); // Map<codigo_usuario, Array<timestamp>>

    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        (timestamp) => now - timestamp < this.windowMs,
      );
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }

  checkLimit(codigoUsuario) {
    const now = Date.now();
    const userRequests = this.requests.get(codigoUsuario) || [];

    // Filter out old requests outside the time window
    const validRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );

    if (validRequests.length >= this.maxRequests) {
      // Calculate when the oldest request will expire
      const oldestRequest = Math.min(...validRequests);
      const resetTime = new Date(oldestRequest + this.windowMs);

      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(codigoUsuario, validRequests);

    return {
      allowed: true,
      remaining: this.maxRequests - validRequests.length,
      resetTime: new Date(now + this.windowMs),
    };
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

const flutterRateLimitMiddleware = (req, res, next) => {
  const { codigo_usuario } = req.body;

  if (!codigo_usuario) {
    return res.status(400).json({
      success: false,
      message: "codigo_usuario es requerido",
    });
  }

  const result = rateLimiter.checkLimit(codigo_usuario);

  // Set rate limit headers
  res.setHeader("X-RateLimit-Limit", rateLimiter.maxRequests);
  res.setHeader("X-RateLimit-Remaining", result.remaining);
  res.setHeader("X-RateLimit-Reset", result.resetTime.toISOString());

  if (!result.allowed) {
    return res.status(429).json({
      success: false,
      message: "Demasiadas solicitudes. Por favor, intenta más tarde.",
      resetTime: result.resetTime.toISOString(),
    });
  }

  next();
};

module.exports = flutterRateLimitMiddleware;
