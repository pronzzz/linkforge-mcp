import { RateLimitError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

export class SecurityGuard {
    private static counts: Map<string, { count: number; resetAt: number }> = new Map();

    /**
     * Enforces basic rate limiting for tools to prevent AI loops or excessive API usage.
     */
    static enforceRateLimit(toolName: string, config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }) {
        const now = Date.now();
        const record = this.counts.get(toolName);

        if (!record || now > record.resetAt) {
            // Reset or initialize
            this.counts.set(toolName, { count: 1, resetAt: now + config.windowMs });
            return;
        }

        if (record.count >= config.maxRequests) {
            logger.warn(`[Security] Rate limit exceeded for tool: ${toolName}`);
            throw new RateLimitError(`Rate limit exceeded for ${toolName}. Try again in ${Math.ceil((record.resetAt - now) / 1000)}s.`);
        }

        record.count += 1;
        this.counts.set(toolName, record);
    }
}
