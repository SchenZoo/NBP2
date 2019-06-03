import mongoose, { Document, Schema } from 'mongoose'
import { ModelName } from '../../../constants/ModelName'
import { IUser } from './User'
import { IEvent } from './Event'
import { IPost } from './Post'

export interface IMessage extends Document {
  text?: string
  sender: IUser | number
  data?: IEvent | IPost
  onModel?: string
}

const messageSchema = new Schema(
  {
    text: String,
    sender: { type: Schema.Types.ObjectId, ref: ModelName.USER },
    onModel: { type: String, required: true },
    data: {
      type: Schema.Types.ObjectId,
      required: false,
      refPath: 'onModel',
    },
    session: { type: Schema.Types.ObjectId, ref: ModelName.CHAT_SESSION },
  },
  { timestamps: true },
)

export const MessageModel = mongoose.model<IMessage>(ModelName.MESSAGE, messageSchema)
