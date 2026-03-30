import Redis from "ioredis";

// Centralized Redis client for connection pooling
const redis = new Redis(process.env.REDIS_URL as string);

export default redis;