import mongoose, { Document, Schema, model } from 'mongoose'
import { ModelName } from '../../../constants/ModelName'
import { IUser } from './User'
import mongoosePaginate = require('mongoose-paginate')

export interface IFriendship extends Document {
  mario: IUser | string
  luigi: IUser | string
}

const friendRequestSchema = new Schema(
  {
    mario: { ref: ModelName.USER, type: Schema.Types.ObjectId },
    luigi: { ref: ModelName.USER, type: Schema.Types.ObjectId },
  },
  { timestamps: true },
)
friendRequestSchema.plugin(mongoosePaginate)

export const FriendshipModel = model<IFriendship>(ModelName.FRIENDSHIP, friendRequestSchema)
