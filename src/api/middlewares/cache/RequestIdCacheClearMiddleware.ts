import { REDIS_CACHE_CONFIG } from "../../../config/RedisOptions";
import Redis from "ioredis";
import get from "lodash.get";

const client = new Redis(REDIS_CACHE_CONFIG as Redis.RedisOptions);

export const removeMongoCacheRequestId = (
  cacheKeyFunction: (id: string) => string,
  requestParamPath: string
) => async (req, res, next) => {
  const identifier = get(req, requestParamPath);
  if (identifier === undefined) {
    console.error(`Removing cache identifier missing ${identifier}`);
    return next();
  }
  const key = cacheKeyFunction(identifier);
  try {
    await client.del(key);
  } catch (error) {
    console.error(`Error clearing cache: ${key}`, error);
  }
  next();
};
