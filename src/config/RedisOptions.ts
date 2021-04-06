export const {
  REDIS_HOST,
  REDIS_PORT = 6379,
  REDIS_PASSWORD,
  REDIS_DB = 0,
  REDIS_CACHE_DB = 2,
  REDIS_QUEUE_DB = 3,
} = process.env;

if (!REDIS_HOST || !REDIS_PORT) {
  console.error("Redis environment variables missing");
  process.exit(1);
}

export const REDIS_CONFIG = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  db: REDIS_DB,
  password: REDIS_PASSWORD,
};

export const REDIS_CACHE_CONFIG = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  db: REDIS_CACHE_DB,
  password: REDIS_PASSWORD,
};

export const REDIS_QUEUE_CONFIG = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  db: REDIS_QUEUE_DB,
  password: REDIS_PASSWORD,
};
