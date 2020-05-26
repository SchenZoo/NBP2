import { SocketService } from "./../../services/SocketService";
import { Container } from "typedi";
import { IUser } from "./User";
import mongoose, { Document, Schema } from "mongoose";
import { ModelName } from "../../../constants/ModelName";
import { IMessage } from "./Message";
import { SocketEventNames } from "../../../constants/SocketEventNames";
import { getUserRoom } from "../../../constants/SocketRoomNames";
export interface IChatSession extends Document {
  participants: IUser[];
  participantIds: string[];
  type: ChatSessionTypes;
  messages?: IMessage[];
}

export enum ChatSessionTypes {
  PRIVATE = "private",
  GROUP = "group",
}

const chatSessionSchema = new Schema(
  {
    name: {
      type: String,
    },
    participantIds: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: ModelName.USER,
      },
    ],
    type: {
      type: String,
    },
    lastMessage: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  }
);

chatSessionSchema.virtual("participants", {
  ref: ModelName.USER,
  localField: "participantIds",
  foreignField: "_id",
  justOne: false,
});

chatSessionSchema.pre<IChatSession>("save", function (next) {
  const socketService = Container.get(SocketService);
  this.participantIds.forEach((participantId) => {
    socketService.sendEventInRoom(
      SocketEventNames.SESSION_CREATED,
      {
        sessionId: this._id,
      },
      getUserRoom(participantId)
    );
  });
  next();
});

export const ChatSessionModel = mongoose.model<IChatSession>(
  ModelName.CHAT_SESSION,
  chatSessionSchema
);
