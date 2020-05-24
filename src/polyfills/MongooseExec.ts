import { REDIS_CACHE_CONFIG } from "./../config/RedisOptions";
import mongoose from "mongoose";
import Redis from "ioredis";

const client = new Redis(REDIS_CACHE_CONFIG as Redis.RedisOptions);

const { exec } = mongoose.Query.prototype;
(mongoose as any).Query.prototype.exec = async function () {
  if (!this.useCache || !this.cacheKey) {
    return exec.apply(this, arguments);
  }

  const { lean, ...restMongooseOptions } = this._mongooseOptions;

  const key = JSON.stringify({
    query: { ...this.getQuery() },
    mongooseOptions: restMongooseOptions,
    modelName: this.model.modelName,
  });

  const cacheValue = await client.hget(this.cacheKey, key);
  if (cacheValue) {
    const cacheValueParsed = JSON.parse(cacheValue);
    if (lean) {
      return cacheValueParsed;
    }
    if (this.allowPagination) {
      return {
        ...cacheValueParsed,
        docs: cacheValueParsed.docs.map((value) => new this.model(value)),
      };
    }
    return Array.isArray(cacheValueParsed)
      ? cacheValueParsed.map((value) => new this.model(value))
      : new this.model(cacheValueParsed);
  }
  let result = await exec.apply(this, arguments);
  if (this.allowPagination) {
    result = {
      docs: result,
      limit: this.paginationLimit,
      offset: this.paginationSkip,
      total: await this.model.countDocuments(this.getQuery()),
    };
  }

  client.hset(this.cacheKey, key, JSON.stringify(result));
  return result;
};
