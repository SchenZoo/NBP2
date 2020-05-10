import { EventSubscriber, On } from 'event-dispatch'
import Container from 'typedi'
import { SocketService } from '../services/SocketService'
import { IPrivateMessageSent } from '../app_models/event_dispatch/IPrivateMessageSent'
import { ChatSessionModel } from '../database/models/ChatSession'
import { SocketEventNames } from '../../constants/SocketEventNames'
import { getUserRoom } from '../../constants/SocketRoomNames'
import { MessageModel, IMessage } from '../database/models/Message'

@EventSubscriber()
export class MessageSubscriber {
  private socketService: SocketService
  constructor() {
    this.socketService = Container.get(SocketService)
  }

  @On('privateMessageSent')
  async onUserCreate(body: IPrivateMessageSent) {
    const sessionsCount = await ChatSessionModel.find({ participants: body.sender })
      // tslint:disable-next-line: align
    ;(async () => {
      let message = body.message
      if (body.message.data) {
        message = (await MessageModel.findById(body.message.id).populate('data')) as IMessage
      }
      body.session.participants.forEach(participant => {
        this.socketService.sendEventInRoom(
          SocketEventNames.MESSAGE,
          {
            message,
            session: body.session,
            sessionsCount,
          },
          getUserRoom(participant.id),
        )
      })
    })()
  }
}
