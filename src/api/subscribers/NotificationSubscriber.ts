import { EventSubscriber, On } from "event-dispatch";
import { SocketService } from "../services/SocketService";
import Container from "typedi";
import { INotificationSent } from "../app_models/event_dispatch/INotificationSent";
import { SocketEventNames } from "../../constants/SocketEventNames";
import { getUserRoom } from "../../constants/SocketRoomNames";

@EventSubscriber()
export class NotificationSubscriber {
  private socketService: SocketService;
  constructor() {
    this.socketService = Container.get(SocketService);
  }

  @On("notificationSent")
  async onUserCreate(body: INotificationSent) {
    this.socketService.sendEventInRoom(
      SocketEventNames.NOTIFICATION,
      body.notification,
      getUserRoom(body.receiverId)
    );
  }
}
