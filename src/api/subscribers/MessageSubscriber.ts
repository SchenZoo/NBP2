import { EventSubscriber, On } from 'event-dispatch'
import Container from 'typedi'
import { SocketService } from '../services/SocketService'
import { WebPushNotificationService } from '../services/WebPushNotificationService'
import { IPrivateMessageSent } from '../app_models/event_dispatch/IPrivateMessageSent'
import { ChatSessionModel } from '../database/models/ChatSession'
import { SocketEventNames } from '../../constants/SocketEventNames'
import { getMessageRoom } from '../../constants/SocketRoomNames'
import { getChatLink } from '../misc/Links'
import { MessageModel, IMessage } from '../database/models/Message'

@EventSubscriber()
export class MessageSubscriber {
  private socketService: SocketService
  private webPushService: WebPushNotificationService
  constructor() {
    this.socketService = Container.get(SocketService)
    this.webPushService = Container.get(WebPushNotificationService)
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

      this.socketService.sendEventInRoom(
        SocketEventNames.MESSAGE,
        {
          message,
          session: body.session,
          sessionsCount,
        },
        getMessageRoom(body.receiverId),
      )
    })()
    const payload = this.webPushService.makeWebPushNotification(
      body.sender.username + ' ti je poslao poruku',
      body.message.text ? body.message.text : 'Pogledaj u aplikaciji :)',
      'chat-user-' + body.sender.id,
      getChatLink(body.sender.id),
    )
    this.webPushService.sendWebPushNotification(payload, body.receiverId)
  }
}
