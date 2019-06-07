import { EventSubscriber, On } from 'event-dispatch'
import { SocketService } from '../services/SocketService'
import { WebPushNotificationService } from '../services/WebPushNotificationService'
import Container from 'typedi'
import { INotificationSent } from '../app_models/event_dispatch/INotificationSent'
import { SocketEventNames } from '../../constants/SocketEventNames'
import { getMessageRoom } from '../../constants/SocketRoomNames'
import { EmailService } from '../services/EmailService'

@EventSubscriber()
export class NotificationSubscriber {
  private socketService: SocketService
  private webPushService: WebPushNotificationService
  private emailService: EmailService
  constructor() {
    this.socketService = Container.get(SocketService)
    this.webPushService = Container.get(WebPushNotificationService)
    this.emailService = Container.get(EmailService)
  }

  @On('notificationSent')
  async onUserCreate(body: INotificationSent) {
    // SENDING VIA WEB PUSH
    const payload = this.webPushService.makeWebPushNotification(
      'Nova notifikacija od ' + body.userFrom.username,
      body.notification.text,
      'notification-' + body.receiverId,
      process.env.APP_URL + '/' + body.notification.relativeLink,
    )

    this.webPushService.sendWebPushNotification(payload, body.receiverId)
    // SENDING VIA SOCKET
    this.socketService.sendEventInRoom(SocketEventNames.NOTIFICATION, body.notification, getMessageRoom(body.receiverId))
    // SENDING EMAIL
    this.emailService.sendEmail(body.receiverId, 'Nova notifikacija od ' + body.userFrom.username, body.notification.text)
  }
}
