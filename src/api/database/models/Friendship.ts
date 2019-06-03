import mongoose, { Document, Schema, model } from 'mongoose'
import { ModelName } from '../../../constants/ModelName'
import { IUser } from './User'

export interface IFriendship extends Document {
  mario: IUser | number
  luigi: IUser | number
}

const friendRequestSchema = new Schema(
  {
    mario: { ref: ModelName.USER, type: Schema.Types.ObjectId },
    luigi: { ref: ModelName.USER, type: Schema.Types.ObjectId },
  },
  { timestamps: true },
)

export const FriendshipModel = model<IFriendship>(ModelName.FRIENDSHIP, friendRequestSchema)
