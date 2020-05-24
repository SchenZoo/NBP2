import { initializeEnvironment } from "../config/Environment";

initializeEnvironment();

import { REDIS_CACHE_CONFIG } from "./../config/RedisOptions";

import Redis from "ioredis";

const client = new Redis(REDIS_CACHE_CONFIG as Redis.RedisOptions);

client
  .flushdb()
  .then(() => {
    console.log("Cache cleared");
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
