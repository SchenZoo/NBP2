import { ChatSessionModel, ChatSessionTypes } from '../database/models/ChatSession'
import { Service } from 'typedi'
import { MessageModel } from '../database/models/Message'

@Service()
export class ChatSessionRepository {
  public getSessionBetweenTwoUsers(luigiId: string, marioId: string) {
    return ChatSessionModel.findOne({ participants: { $all: [luigiId, marioId] }, type: ChatSessionTypes.PRIVATE }).populate('participants')
  }

  public async getSessionMessagesPaginated(sessionId: number, skip = 0, take = 20) {
    const paginatedMessage = await MessageModel.paginate({ session: sessionId }, { limit: take, offset: skip, sort: { createdAt: -1 }, populate: 'data' })
    paginatedMessage.docs.reverse()
    return paginatedMessage
  }
}
