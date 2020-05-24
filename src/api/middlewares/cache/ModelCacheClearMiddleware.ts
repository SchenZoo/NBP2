import { REDIS_CACHE_CONFIG } from "../../../config/RedisOptions";
import Redis from "ioredis";
import mongoose from "mongoose";

const client = new Redis(REDIS_CACHE_CONFIG as Redis.RedisOptions);

export const removeMongoCacheByModel = (Model: mongoose.Model<any>) => async (
  req,
  res,
  next
) => {
  const key = Model.modelName;
  try {
    client.del(key)
  } catch (error) {
    console.error(`Error clearing cache: ${key}`, error);
  }
  next();
};
