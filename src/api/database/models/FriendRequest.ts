import mongoose, { Document, Schema, model } from 'mongoose'
import { ModelName } from '../../../constants/ModelName'
import { IUser } from './User'

export interface IFriendRequest extends Document {
  sender: IUser | number
  receiver: IUser | number
}

const friendRequestSchema = new Schema(
  {
    sender: { ref: ModelName.USER, type: Schema.Types.ObjectId },
    receiver: { ref: ModelName.USER, type: Schema.Types.ObjectId },
  },
  { timestamps: true },
)

export const FriendRequestModel = model<IFriendRequest>(ModelName.FRIEND_REQUEST, friendRequestSchema)
