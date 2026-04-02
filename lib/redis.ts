import { Redis } from 'ioredis';

// Attempt to parse environmental variable for Redis connection
// We gracefully fallback to null if no URL provided so local builds don't instantly crash
const redisUrl = process.env.REDIS_URL || '';

export const redis = redisUrl ? new Redis(redisUrl) : null;
