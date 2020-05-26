import {
  ChatSessionModel,
  IChatSession,
} from "./../database/models/ChatSession";
import { SocketService } from "./SocketService";
import Container, { Service } from "typedi";
import { SocketEventNames } from "../../constants/SocketEventNames";
import { getUserRoom } from "../../constants/SocketRoomNames";

@Service()
export class ChatSessionService {
  private socketService: SocketService;
  constructor() {
    this.socketService = Container.get(SocketService);
  }

  async addParticipant(sessionId: string, participantId: string) {
    const session = await ChatSessionModel.findByIdAndUpdate(
      { _id: sessionId },
      { $push: { participantIds: participantId } },
      { new: true }
    ).populate("participants");

    this.emitParticipantsChange(session);
    return session;
  }

  async addMultiParticipants(sessionId: string, participantIds: string[]) {
    const session = await ChatSessionModel.findByIdAndUpdate(
      { _id: sessionId },
      { $push: { participantIds: { $each: participantIds } } },
      { new: true }
    ).populate("participants");

    this.emitParticipantsChange(session);
    return session;
  }

  async removeParticipant(sessionId: string, participantId: string) {
    const session = await ChatSessionModel.findByIdAndUpdate(
      sessionId,
      {
        $pull: { participantIds: { participantId } },
      },
      { new: true }
    ).populate("participants");
    this.emitParticipantsChange(session);
    return session;
  }

  private emitParticipantsChange(session: IChatSession | null) {
    if (session) {
      session.participants.forEach((participant) => {
        this.socketService.sendEventInRoom(
          SocketEventNames.SESSION_CHANGED,
          {
            session,
          },
          getUserRoom(participant._id)
        );
      });
    }
  }
}
