import { IUser } from "./User";
import mongoose, { Document, Schema } from "mongoose";
import { ModelName } from "../../../constants/ModelName";
import { IMessage } from "./Message";
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

export const ChatSessionModel = mongoose.model<IChatSession>(
  ModelName.CHAT_SESSION,
  chatSessionSchema
);
