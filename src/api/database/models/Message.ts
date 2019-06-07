import mongoose, { Document, Schema } from 'mongoose'
import { ModelName } from '../../../constants/ModelName'
import { IUser } from './User'
import { IEvent } from './Event'
import { IPost } from './Post'
import { IChatSession } from './ChatSession'
import mongoosePaginate = require('mongoose-paginate')

export interface IMessage extends Document {
  text?: string
  sender: IUser | number
  data?: IEvent | IPost
  onModel?: string
  session: number | IChatSession
}

const messageSchema = new Schema(
  {
    text: String,
    sender: { type: Schema.Types.ObjectId, ref: ModelName.USER },
    onModel: {
      type: String,
      required: function() {
        return (this as any).data !== undefined
      },
    },
    data: {
      type: Schema.Types.ObjectId,
      required: false,
      refPath: 'onModel',
    },
    session: { type: Schema.Types.ObjectId, ref: ModelName.CHAT_SESSION, required: true },
    files: {
      type: [String],
      get: (urls: string[]) => urls.map(url => `${process.env.APP_HOST}:${process.env.APP_PORT}/public/${url}`),
    },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } },
)
messageSchema.plugin(mongoosePaginate)

export const MessageModel = mongoose.model<IMessage>(ModelName.MESSAGE, messageSchema)

export enum MessageDataModels {
  Post = 'Post',
  Event = 'Event',
}
