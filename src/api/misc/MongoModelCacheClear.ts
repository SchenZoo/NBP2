import { REDIS_CACHE_CONFIG } from "./../../config/RedisOptions";
import { Schema } from "mongoose";
import Redis from "ioredis";

const client = new Redis(REDIS_CACHE_CONFIG as Redis.RedisOptions);

export function initializeCacheClear(
  schema: Schema,
  modelName: string,
  cacheItemFunction: (id: string) => string
) {
  async function clearListCache() {
    console.log(`clearing all ${modelName} cache`);
    await client.del(modelName);
  }

  async function clearOneItemCache(query?: any) {
    if (query && query._id) {
      console.log(`clearing cache ${modelName}`, query._id);
      await client.del(cacheItemFunction(query._id));
    }
  }

  schema.pre("findOneAndUpdate", function () {
    clearOneItemCache(this.getQuery());
    clearListCache();
  });

  schema.pre("update", clearListCache);

  schema.pre("updateMany", clearListCache);

  schema.pre("updateOne", function () {
    clearOneItemCache(this.getQuery());
    clearListCache();
  });

  schema.pre("remove", function () {
    clearOneItemCache({ _id: this._id });
    clearListCache();
  });

  schema.pre("save", () => {
    clearListCache();
  });
}
