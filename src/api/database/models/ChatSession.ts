import { User } from './User'
import mongoose, { Document, Schema, modelNames } from 'mongoose'
import { ModelName } from '../../../constants/ModelName'

export interface IChatSession extends Document {
  participants: User[]
  type: ChatSessionTypes
}

export enum ChatSessionTypes {
  PRIVATE = 'private',
  GROUP = 'group',
}

const chatSessionSchema = new Schema(
  {
    participants: [
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
  { timestamps: true },
)

export const ChatSessionModel = mongoose.model<IChatSession>(ModelName.COMMENT, chatSessionSchema)
