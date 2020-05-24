import { EventSubscriber, On } from 'event-dispatch';
import { SocketService } from '../services/SocketService';
import Container from 'typedi';
import { INotificationSent } from '../app_models/event_dispatch/INotificationSent';
import { SocketEventNames } from '../../constants/SocketEventNames';
import { getUserRoom } from '../../constants/SocketRoomNames';
import { EmailService } from '../services/EmailService';

@EventSubscriber()
export class NotificationSubscriber {
  private socketService: SocketService;
  private emailService: EmailService;
  constructor() {
    this.socketService = Container.get(SocketService);
    this.emailService = Container.get(EmailService);
  }

  @On('notificationSent')
  async onUserCreate(body: INotificationSent) {
    this.socketService.sendEventInRoom(SocketEventNames.NOTIFICATION, body.notification, getUserRoom(body.receiverId));
    // SENDING EMAIL
    this.emailService.sendEmail(body.receiverId, 'Nova notifikacija od ' + body.userFrom.username, body.notification.text);
  }
}
