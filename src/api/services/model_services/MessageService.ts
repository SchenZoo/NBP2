import { Service } from 'typedi'
import { ChatSessionRepository } from '../../repositories/ChatSessionRepository'
import { ChatSessionModel, ChatSessionTypes, IChatSession } from '../../database/models/ChatSession'
import { MessageModel, IMessage } from '../../database/models/Message'
import { EventDispatcher } from 'event-dispatch'
import { IPrivateMessageSent } from '../../app_models/event_dispatch/IPrivateMessageSent'
import { ChatMessageValidator } from '../../validators/ChatMessageValidator'
import { FileService } from '../FileService'
import { ModelImagePath } from '../../../constants/ModelImagePath'
import { IUser } from '../../database/models/User'

@Service()
export class MessageService {
  constructor(private chatSessionRepo: ChatSessionRepository, private fileService: FileService) {}
  async addMessage(sender: IUser, receiverId: string, chatMessage: ChatMessageValidator) {
    let session = await this.chatSessionRepo.getSessionBetweenTwoUsers(sender.id, receiverId)
    if (chatMessage.filesBase64 && chatMessage.filesBase64.length) {
      chatMessage.files = await Promise.all(
        chatMessage.filesBase64.map(fileBase64 => this.fileService.addBase64Image(fileBase64, ModelImagePath.PRIVATE_CHAT_MESSAGE)),
      )
    }
    if (!session) {
      session = new ChatSessionModel({
        type: ChatSessionTypes.PRIVATE,
        participants: [sender.id, receiverId],
      })
      await session.save()
    }
    const message = await new MessageModel({
      text: chatMessage.text,
      files: chatMessage.files,
      data: chatMessage.data,
      onModel: chatMessage.onModel,
      session: session.id,
      sender: sender.id,
    }).save()
    const eventDispatcher = new EventDispatcher()
    eventDispatcher.dispatch('privateMessageSent', {
      sender,
      receiverId,
      session,
      message,
    } as IPrivateMessageSent)
    return message
  }
}
