import { JsonController, UseBefore, Post, CurrentUser, Param, Body, Get, QueryParams } from 'routing-controllers'
import { passportJwtMiddleware } from '../middlewares/PassportJwtMiddleware'
import { IUser, UserModel } from '../database/models/User'
import { ChatSessionModel } from '../database/models/ChatSession'
import { ObjectFromParamNotFound } from '../errors/ObjectFromParamNotFound'
import { ChatSessionRepository } from '../repositories/ChatSessionRepository'
import { MessageService } from '../services/model_services/MessageService'
import { ChatMessageValidator } from '../validators/ChatMessageValidator'
import { Pagination } from '../misc/QueryPagination'

@JsonController('/chat')
@UseBefore(passportJwtMiddleware)
export class ChatController {
  constructor(private chatModelService: MessageService, private chatSessionRepo: ChatSessionRepository) {}
  @Post('/message/:id')
  public async sendMessage(
    @CurrentUser() user: IUser,
    @Param('id') id: string,
    @Body({ validate: { whitelist: true }, type: ChatMessageValidator }) body: ChatMessageValidator,
  ) {
    return this.chatModelService.addMessage(user, id, body)
  }
  @Get('/session')
  public async getSessions(@CurrentUser() user: IUser, @QueryParams() query: Pagination) {
    return ChatSessionModel.paginate({ participants: user.id }, { sort: { createdAt: -1 }, limit: query.take, offset: query.skip, populate: 'participants' })
  }
  @Get('/user/:id')
  public async getUser(@CurrentUser() user: IUser, @Param('id') id: string, @QueryParams() query: Pagination) {
    const session = await this.chatSessionRepo.getSessionBetweenTwoUsers(user.id, id)
    if (!session) {
      return { session: null, data: {docs: [], total: 0}, user: await UserModel.findById(id) }
    }
    const messagesWithCount = await this.chatSessionRepo.getSessionMessagesPaginated(session.id, query.skip, query.take)
    return { session, data: messagesWithCount, user: await UserModel.findById(id) }
  }
  @Get('/session/:id')
  public async getSessionById(@Param('id') id: string, @QueryParams() query: Pagination) {
    const session = await ChatSessionModel.findById(id)
    if (!session) {
      return { session: null }
    }
    const messagesWithCount = await this.chatSessionRepo.getSessionMessagesPaginated(session.id, query.skip, query.take)
    return { session, data: messagesWithCount }
  }
}
