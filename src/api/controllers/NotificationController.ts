import {
  JsonController,
  UseBefore,
  Get,
  QueryParams,
  CurrentUser,
  Put,
  Req,
} from "routing-controllers";
import { passportJwtMiddleware } from "../middlewares/PassportJwtMiddleware";
import { Pagination } from "../misc/QueryPagination";
import { IUser } from "../database/models/User";
import { NotificationModel } from "../database/models/Notification";
import { NotificationPolicy } from "../policy/NotificationPolicy";
import { policyCheck } from "../middlewares/AuthorizationMiddlewares";
import { BASE_POLICY_NAMES } from "../policy/BasePolicy";
import { INotificationRequest } from "../app_models/requests/INotificationRequest";

@JsonController("/notifications")
@UseBefore(passportJwtMiddleware)
export class NotificationController {
  @Get()
  public async get(
    @QueryParams() query: Pagination,
    @CurrentUser() user: IUser
  ) {
    return NotificationModel.find({ receiver: user.id })
      .sort({ createdAt: -1 })
      .paginate(query.skip, query.take)
      .populate("emitter");
  }

  @Put("/:id/opeted-at")
  @UseBefore(policyCheck(BASE_POLICY_NAMES.UPDATE, NotificationPolicy))
  public async openNotification(@Req() request: INotificationRequest) {
    request.notification.openedAt = new Date();
    request.notification.save();
    return { message: "Opened" };
  }
}
