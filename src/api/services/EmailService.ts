import { REDIS_QUEUE_CHANNELS } from "./../../constants/RedisQueueChannels";
import { RedisQueueService } from "./RedisQueueService";
import { REDIS_CONFIG } from "./../../config/RedisOptions";
import Redis from "ioredis";
import { CACHE_KEYS } from "./../../constants/CacheKeys";
import { Service } from "typedi";
import { UserModel } from "../database/models/User";

@Service()
export class EmailService {
  constructor(private redisQueueService: RedisQueueService) {}
  async sendEmail(receiverId: string, subject: string, text: string) {
    const receiver = await UserModel.findById(receiverId).cache({
      cacheKey: CACHE_KEYS.ITEM_USER(receiverId),
    });
    if (!receiver || !receiver.email) {
      return false;
    }
    const mailOptions = {
      from: "Stane <aleksandar.stankovic6496@gmail.com>",
      to: receiver.email,
      subject,
      text,
    };

    return this.redisQueueService.sendMessageWithResponse(
      REDIS_QUEUE_CHANNELS.EMAIL_REQUEST,
      mailOptions
    );
  }
}
