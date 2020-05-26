import { SocketEventNames } from "./../../../constants/SocketEventNames";
import { SocketService } from "./../../services/SocketService";
import { Container } from "typedi";
import { ChatSessionModel } from "./ChatSession";
import { Document, Schema, model } from "mongoose";
import { ModelName } from "../../../constants/ModelName";
import { IUser } from "./User";
import { getUserRoom } from "../../../constants/SocketRoomNames";

export interface IFriendship extends Document {
  marioId: string;
  luigiId: string;
  mario: IUser;
  luigi: IUser;
  chatSessionId: string;
}

const friendshipSchema = new Schema<IFriendship>(
  {
    marioId: {
      ref: ModelName.USER,
      type: Schema.Types.ObjectId,
      required: true,
    },
    luigiId: {
      ref: ModelName.USER,
      type: Schema.Types.ObjectId,
      required: true,
    },
    chatSessionId: {
      type: Schema.Types.ObjectId,
      ref: ModelName.CHAT_SESSION,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  }
);

friendshipSchema.virtual("mario", {
  ref: ModelName.USER,
  localField: "marioId",
  foreignField: "_id",
  justOne: true,
});

friendshipSchema.virtual("luigi", {
  ref: ModelName.USER,
  localField: "luigiId",
  foreignField: "_id",
  justOne: true,
});

friendshipSchema.pre<IFriendship>("remove", async function () {
  if (this.chatSessionId) {
    const socketService = Container.get(SocketService);
    const sendSocketEventForRemoveSession = (id: string) => {
      socketService.sendEventInRoom(
        SocketEventNames.SESSION_REMOVED,
        {
          sessionId: this.chatSessionId,
        },
        getUserRoom(id)
      );
    };
    sendSocketEventForRemoveSession(this.luigiId);
    sendSocketEventForRemoveSession(this.marioId);
    await ChatSessionModel.deleteOne({ _id: this.chatSessionId });
  }
});

export const FriendshipModel = model<IFriendship>(
  ModelName.FRIENDSHIP,
  friendshipSchema
);
