import { CACHE_KEYS } from "./../../constants/CacheKeys";
import { SectionSubscriptionModel } from "./../database/models";
import {
  JsonController,
  UseBefore,
  CurrentUser,
  Post,
  Body,
  Param,
  Delete,
  Get,
} from "routing-controllers";
import { passportJwtMiddleware } from "../middlewares/PassportJwtMiddleware";
import { SectionSubscriptionValidation } from "../validators/SectionSubscriptionValidator";
import { IUser } from "../database/models/User";

@JsonController("/sections")
@UseBefore(passportJwtMiddleware)
export class SectionSubscriptionController {
  constructor() {}

  @Get("/:sectionId/subscriptions")
  public async get(
    @Param("sectionId") sectionId: string,
    @CurrentUser() user: IUser
  ) {
    return SectionSubscriptionModel.findOne({
      sectionId,
      userId: user._id,
    });
  }

  @Post("/subscriptions")
  public async create(
    @Body() subscriptionBody: SectionSubscriptionValidation,
    @CurrentUser() user: IUser
  ) {
    const sectionSubscription = new SectionSubscriptionModel({
      ...subscriptionBody,
      userId: user._id,
    });

    return sectionSubscription.save();
  }

  @Delete("/:sectionId([a-z0-9]{24})/subscriptions")
  public async delete(
    @Param("sectionId") sectionId: string,
    @CurrentUser() user: IUser
  ) {
    return SectionSubscriptionModel.deleteMany({
      userId: user._id,
      sectionId,
    });
  }
}
