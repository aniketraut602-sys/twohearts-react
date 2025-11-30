const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for message sending
 * Prevents spam and abuse
 */
const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 messages per minute
    message: 'Too many messages sent. Please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Rate limit per user
        return req.user?.id?.toString() || req.ip;
    },
    skip: (req) => {
        // Skip rate limiting for admins (if you add admin role later)
        return req.user?.role === 'admin';
    }
});

/**
 * Rate limiter for connection requests
 * Prevents spam connection requests
 */
const connectionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 connection requests per hour
    message: 'Too many connection requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?.id?.toString() || req.ip;
    }
});

/**
 * Rate limiter for profile updates
 * Prevents excessive profile changes
 */
const profileUpdateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 profile updates per hour
    message: 'Too many profile updates. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?.id?.toString() || req.ip;
    }
});

/**
 * General API rate limiter per user
 * Prevents API abuse
 */
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute per user
    message: 'Too many requests. Please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?.id?.toString() || req.ip;
    }
});

module.exports = {
    messageLimiter,
    connectionLimiter,
    profileUpdateLimiter,
    apiLimiter
};
