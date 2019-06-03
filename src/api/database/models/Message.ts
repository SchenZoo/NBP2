import { User } from './User'
import { Section } from './Section'
import { Group } from './Group'
import mongoose, { Document, Schema } from 'mongoose'
import { ModelName } from '../../../constants/ModelName'

export interface IMessage extends Document {
  text?: string
  sender: User | number
  data?: Group | Section
  onModel?: string
}

enum Messageable {
  Group = ModelName.GROUP,
  Section = ModelName.SECTION,
}

const messageSchema = new Schema(
  {
    text: String,
    sender: { type: Schema.Types.ObjectId, ref: ModelName.USER },
    onModel: { type: String, required: true, enum: Messageable },
    data: {
      type: Schema.Types.ObjectId,
      required: false,
      refPath: 'onModel',
    },
  },
  { timestamps: true },
)

export const MessageModel = mongoose.model<IMessage>(ModelName.MESSAGE, messageSchema)
