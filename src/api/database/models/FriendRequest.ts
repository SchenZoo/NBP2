import mongoose, { Document, Schema, model } from 'mongoose'
import { ModelName } from '../../../constants/ModelName'
import { IUser } from './User'
import mongoosePaginate = require('mongoose-paginate')

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
friendRequestSchema.plugin(mongoosePaginate)

export const FriendRequestModel = model<IFriendRequest>(ModelName.FRIEND_REQUEST, friendRequestSchema)
