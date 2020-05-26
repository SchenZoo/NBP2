import { REDIS_QUEUE_CHANNELS } from "./../../constants/RedisQueueChannels";
import { RoleNames } from "./../../constants/RoleNames";
import { RedisQueueService } from "./../services/RedisQueueService";
import { JsonController, Get, UseBefore } from "routing-controllers";
import { passportJwtMiddleware } from "../middlewares/PassportJwtMiddleware";
import { checkRole } from "../middlewares/AuthorizationMiddlewares";

@JsonController("/statistics")
@UseBefore(checkRole([RoleNames.ADMIN]))
@UseBefore(passportJwtMiddleware)
export class StatisticController {
  constructor(private redisQueueService: RedisQueueService) {}

  @Get("/emails")
  public async getEmailStats() {
    return this.redisQueueService.sendMessageWithResponse(
      REDIS_QUEUE_CHANNELS.GET_STATS
    );
  }
}
