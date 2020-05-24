import mongoose, { Document, Schema, model } from "mongoose";
import { ModelName } from "../../../constants/ModelName";
import { IUser } from "./User";

export interface IFriendRequest extends Document {
  sender?: IUser;
  receiver?: IUser;
  senderId: string;
  receiverId: string;
}

const friendRequestSchema = new Schema(
  {
    senderId: {
      ref: ModelName.USER,
      type: Schema.Types.ObjectId,
      required: true,
    },
    receiverId: {
      ref: ModelName.USER,
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  }
);

friendRequestSchema.virtual("sender", {
  ref: ModelName.USER,
  localField: "senderId",
  foreignField: "_id",
  justOne: true,
});

friendRequestSchema.virtual("receiver", {
  ref: ModelName.USER,
  localField: "receiverId",
  foreignField: "_id",
  justOne: true,
});

export const FriendRequestModel = model<IFriendRequest>(
  ModelName.FRIEND_REQUEST,
  friendRequestSchema
);
