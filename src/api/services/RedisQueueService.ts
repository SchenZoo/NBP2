import { REDIS_QUEUE_CHANNELS } from "./../../constants/RedisQueueChannels";
import { REDIS_QUEUE_CONFIG } from "./../../config/RedisOptions";
import RedisInstance, { Redis, RedisOptions } from "ioredis";
import { Service } from "typedi";
import md5 from "md5";

import { EventEmitter } from "events";
import { safeJsonParse } from "../misc/SafeJsonParse";

@Service()
export class RedisQueueService {
  redisPub: Redis;
  redisSub: Redis;
  emitter: EventEmitter;

  constructor() {
    this.redisPub = new RedisInstance(REDIS_QUEUE_CONFIG as RedisOptions);
    this.redisSub = new RedisInstance(REDIS_QUEUE_CONFIG as RedisOptions);
    this.emitter = new EventEmitter();
    this.initializeListeners();
  }

  private initializeListeners() {
    this.redisSub.on("message", (channel, data) => {
      const parsedData = safeJsonParse(data);
      this.emitter.emit(channel, parsedData);
    });
    // subscribe to all channels
    this.redisSub.subscribe(...Object.values(REDIS_QUEUE_CHANNELS));
  }
  async sendMessageWithResponse(channel: string, data: any, timeout = 30000) {
    const messageIdentifier = md5(
      JSON.stringify(data) +
        new Date().getUTCMilliseconds() +
        Math.random() * 10e6
    );
    const responseChannel = `${channel}-${messageIdentifier}`;
    const responsePromise = new Promise((resolve, reject) => {
      const handler = (responseData: any) => {
        this.redisSub.unsubscribe(responseChannel);
        clearTimeout(failTimeout);
        return resolve(responseData);
      };
      this.emitter.once(responseChannel, handler);
      this.redisSub.subscribe(responseChannel);
      const failTimeout = setTimeout(() => {
        this.redisSub.unsubscribe(responseChannel);
        this.emitter.removeListener(responseChannel, handler);
        return reject("Timeout");
      }, timeout);
    });
    this.sendMessage(channel, messageIdentifier, data);
    return responsePromise;
  }

  sendMessage(channel: string, identifier: string, data: any) {
    if (!identifier) {
      throw new Error("Identifier is required when sending redis messages");
    }
    this.redisPub.publish(channel, JSON.stringify({ id: identifier, data }));
    return "Message sent";
  }
}
