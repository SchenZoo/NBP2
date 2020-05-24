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
} from "routing-controllers";
import { passportJwtMiddleware } from "../middlewares/PassportJwtMiddleware";
import { IUser, UserModel } from "../database/models/User";
import { ChatSessionModel } from "../database/models/ChatSession";
import { ChatSessionRepository } from "../repositories/ChatSessionRepository";
import { MessageService } from "../services/model_services/MessageService";
import { ChatMessageValidator } from "../validators/ChatMessageValidator";
import { Pagination } from "../misc/QueryPagination";

@JsonController("/chat")
@UseBefore(passportJwtMiddleware)
export class ChatController {
  constructor(
    private chatModelService: MessageService,
    private chatSessionRepo: ChatSessionRepository
  ) {}

  @Post("/sessions/users/:id/messages")
  public async sendMessage(
    @CurrentUser() user: IUser,
    @Param("id") id: string,
    @Body({ validate: { whitelist: true }, type: ChatMessageValidator })
    body: ChatMessageValidator
  ) {
    return this.chatModelService.addMessage(user, id, body);
  }

  @Get("/sessions")
  public async getSessions(
    @CurrentUser() user: IUser,
    @QueryParams() query: Pagination
  ) {
    return ChatSessionModel.find({ participants: user.id })
      .paginate(query.skip, query.take)
      .populate("participants")
      .sort({ createdAt: -1 });
  }

  @Get("/sessions/users/:id")
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
      return { session: null, data: { docs: [], total: 0 }, user: chatUser };
    }
    const messagesWithCount = await this.chatSessionRepo.getSessionMessagesPaginated(
      session.id,
      query.skip,
      query.take
    );
    return { session, data: messagesWithCount, user: chatUser };
  }

  @Get("/sessions/:id")
  public async getSessionById(
    @Param("id") id: string,
    @QueryParams() query: Pagination
  ) {
    const session = await ChatSessionModel.findById(id);
    if (!session) {
      return { session: null };
    }
    const messagesWithCount = await this.chatSessionRepo.getSessionMessagesPaginated(
      session.id,
      query.skip,
      query.take
    );
    return { session, data: messagesWithCount };
  }
}
