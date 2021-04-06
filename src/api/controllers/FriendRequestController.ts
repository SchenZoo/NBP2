import { FriendRepository } from "./../repositories/FriendRepository";
import {
  FriendRequestPolicy,
  IFriendRequestPolicyRequest,
  FRIEND_REQUEST_POLICIES,
} from "./../policy/FriendshipRequestPolicy";
import { BASE_POLICY_NAMES } from "./../policy/BasePolicy";
import {
  ChatSessionModel,
  ChatSessionTypes,
} from "./../database/models/ChatSession";
import { ObjectFromParamNotFound } from "./../errors/ObjectFromParamNotFound";
import {
  JsonController,
  UseBefore,
  Get,
  QueryParams,
  CurrentUser,
  Params,
  Post,
  Param,
  Delete,
  Req,
} from "routing-controllers";
import { passportJwtMiddleware } from "../middlewares/PassportJwtMiddleware";
import { Pagination } from "../misc/QueryPagination";
import { IUser } from "../database/models/User";
import { FriendRequestModel } from "../database/models/FriendRequest";
import { ConflictError } from "../errors/ConflictError";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { FriendshipModel } from "../database/models/Friendship";
import { policyCheck } from "../middlewares/AuthorizationMiddlewares";

@JsonController("/friend_requests")
@UseBefore(passportJwtMiddleware)
export class FriendRequestController {
  constructor(
    private notifyRepo: NotificationRepository,
    private friendRepo: FriendRepository
  ) {}
  @Get("/received")
  public async getReceivedFriendRequests(
    @QueryParams() query: Pagination,
    @CurrentUser() user: IUser
  ) {
    return FriendRequestModel.find({ receiverId: user.id })
      .sort({ createdAt: -1 })
      .paginate(query.skip, query.take)
      .populate("sender");
  }

  @Get("/sent")
  public async getSentFriendRequests(
    @QueryParams() query: Pagination,
    @CurrentUser() user: IUser
  ) {
    return FriendRequestModel.find({ senderId: user.id })
      .sort({ createdAt: -1 })
      .paginate(query.skip, query.take)
      .populate("receiver");
  }

  @Post("/:id")
  public async create(@CurrentUser() user: IUser, @Param("id") id: string) {
    const [friendRequest, friendship] = await Promise.all([
      this.friendRepo.findFriendRequestBetweenUsers(user.id, id),
      this.friendRepo.findFriendshipBetweenUsers(user.id, id),
    ]);

    if (friendRequest || friendship) {
      throw new ConflictError("Friend request already sent.");
    }
    this.notifyRepo.saveViaUser(
      `Imate novi friend request od ${user.username}.`,
      user,
      id
    );
    return new FriendRequestModel({
      senderId: user.id,
      receiverId: id,
    }).save();
  }

  @Post("/:id/accept")
  @UseBefore(policyCheck(FRIEND_REQUEST_POLICIES.ACCEPT, FriendRequestPolicy))
  public async acceptFriendRequest(
    @CurrentUser() user: IUser,
    @Req() req: IFriendRequestPolicyRequest
  ) {
    const friendRequest = req.requestFriendRequest;
    await friendRequest.remove();
    const friendship = await this.friendRepo.findFriendshipBetweenUsers(
      friendRequest.receiverId,
      friendRequest.senderId
    );

    if (friendship) {
      throw new ConflictError("You two are already friends!");
    }
    this.notifyRepo.saveViaUser(
      `${user.username} je prihvatio zahtev za prijateljstvo.`,
      user,
      friendRequest.senderId
    );
    const chatSession = await new ChatSessionModel({
      type: ChatSessionTypes.PRIVATE,
      participantIds: [friendRequest.senderId, user._id],
    }).save();
    const newFriendship = await new FriendshipModel({
      marioId: friendRequest.senderId,
      luigiId: user.id,
      chatSessionId: chatSession._id,
    }).save();

    await newFriendship.populate("mario").populate("luigi").execPopulate();

    return newFriendship;
  }

  @Delete("/:id")
  @UseBefore(policyCheck(BASE_POLICY_NAMES.DELETE, FriendRequestPolicy))
  public async delete(@Req() req: IFriendRequestPolicyRequest) {
    return req.requestFriendRequest.remove();
  }
}
