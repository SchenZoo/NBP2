import { ObjectFromParamNotFound } from "./../errors/ObjectFromParamNotFound";
import {
  ChatSessionPolicy,
  IChatSessionPolicyRequest,
} from "./../policy/ChatSessionPolicy";
import { BASE_POLICY_NAMES } from "./../policy/BasePolicy";
import { CACHE_KEYS } from "./../../constants/CacheKeys";
import {
  JsonController,
  UseBefore,
  Post,
  CurrentUser,
  Param,
  Body,
  Get,
  QueryParams,
  Req,
} from "routing-controllers";
import { passportJwtMiddleware } from "../middlewares/PassportJwtMiddleware";
import { IUser, UserModel } from "../database/models/User";
import { ChatSessionModel } from "../database/models/ChatSession";
import { ChatSessionRepository } from "../repositories/ChatSessionRepository";
import { MessageService } from "../services/model_services/MessageService";
import { ChatMessageValidator } from "../validators/ChatMessageValidator";
import { Pagination } from "../misc/QueryPagination";
import { policyCheck } from "../middlewares/AuthorizationMiddlewares";

@JsonController("/chat/sessions")
@UseBefore(passportJwtMiddleware)
export class ChatController {
  constructor(
    private chatModelService: MessageService,
    private chatSessionRepo: ChatSessionRepository
  ) {}

  @Get("/")
  public async getSessions(
    @CurrentUser() user: IUser,
    @QueryParams() query: Pagination
  ) {
    return ChatSessionModel.find({ participantIds: user.id })
      .paginate(query.skip, query.take)
      .populate("participants")
      .sort({ createdAt: -1 });
  }

  @Get("/:id")
  public async getSessionById(
    @Param("id") id: string,
    @QueryParams() query: Pagination
  ) {
    const session = await ChatSessionModel.findById(id).populate(
      "participants"
    );
    if (!session) {
      return { session: null };
    }
    const messagesWithCount = await this.chatSessionRepo.getSessionMessagesPaginated(
      session.id,
      query.skip,
      query.take
    );
    return { session, messages: messagesWithCount };
  }

  @Post("/:id/messages")
  @UseBefore(policyCheck(BASE_POLICY_NAMES.UPDATE, ChatSessionPolicy))
  public async sendMessage(
    @CurrentUser() user: IUser,
    @Body({ validate: { whitelist: true }, type: ChatMessageValidator })
    body: ChatMessageValidator,
    @Req() req: IChatSessionPolicyRequest
  ) {
    return this.chatModelService.addMessage(user, req.requestSession, body);
  }

  @Get("/users/:id")
  public async getUser(
    @CurrentUser() user: IUser,
    @Param("id") id: string,
    @QueryParams() query: Pagination
  ) {
    const session = await this.chatSessionRepo.getSessionBetweenTwoUsers(
      user.id,
      id
    );
    const chatUser = await UserModel.findById(id).cache({
      cacheKey: CACHE_KEYS.ITEM_USER(id),
    });
    if (!session) {
      throw new ObjectFromParamNotFound("ChatSession", id);
    }
    const messagesWithCount = await this.chatSessionRepo.getSessionMessagesPaginated(
      session.id,
      query.skip,
      query.take
    );
    return { session, messages: messagesWithCount, user: chatUser };
  }
}
