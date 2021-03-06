import { EventSubscriber, On } from "event-dispatch";
import Container from "typedi";
import { SocketService } from "../services/SocketService";
import { IPrivateMessageSent } from "../app_models/event_dispatch/IPrivateMessageSent";
import { SocketEventNames } from "../../constants/SocketEventNames";
import { getUserRoom } from "../../constants/SocketRoomNames";
import { MessageModel } from "../database/models/Message";

@EventSubscriber()
export class MessageSubscriber {
  private socketService: SocketService;
  constructor() {
    this.socketService = Container.get(SocketService);
  }

  @On("privateMessageSent")
  async onMessageSent(body: IPrivateMessageSent) {
    const { message, session } = body;
    session.participants.forEach((participant) => {
      this.socketService.sendEventInRoom(
        SocketEventNames.MESSAGE,
        {
          message,
          session,
        },
        getUserRoom(participant.id)
      );
    });
  }
}
