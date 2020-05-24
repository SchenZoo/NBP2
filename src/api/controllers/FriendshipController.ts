import {
  FriendshipPolicy,
  IFriendshipPolicyRequest,
} from "./../policy/FriendshipPolicy";
import { BASE_POLICY_NAMES } from "./../policy/BasePolicy";
import {
  JsonController,
  UseBefore,
  Get,
  QueryParams,
  CurrentUser,
  Post,
  Param,
  Delete,
  Req,
} from "routing-controllers";
import { passportJwtMiddleware } from "../middlewares/PassportJwtMiddleware";
import { Pagination } from "../misc/QueryPagination";
import { IUser } from "../database/models/User";
import { FriendshipModel } from "../database/models/Friendship";
import { policyCheck } from "../middlewares/AuthorizationMiddlewares";

@JsonController("/friends")
@UseBefore(passportJwtMiddleware)
export class FriendshipController {
  @Get()
  public async getAll(
    @QueryParams() query: Pagination,
    @CurrentUser() user: IUser
  ) {
    return FriendshipModel.find({
      $or: [{ marioId: user.id }, { luigiId: user.id }],
    })
      .sort({ createdAt: -1 })
      .paginate(query.skip, query.take)
      .populate("mario")
      .populate("luigi");
  }

  @Delete("/:id")
  @UseBefore(policyCheck(BASE_POLICY_NAMES.DELETE, FriendshipPolicy))
  public async delete(@Req() req: IFriendshipPolicyRequest) {
    const friendship = req.requestFriendship;
    return friendship.remove();
  }
}
