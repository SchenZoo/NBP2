import mongoose, { Document, Schema } from 'mongoose'
import { User } from './User'
import { Post } from './Post'
import { Section } from './Section'
import { ModelName } from '../../../constants/ModelName'

export interface IRemindable extends Document {}

enum Remindable {
  Event = ModelName.EVENT,
}

const reminderSchema = new Schema(
  {
    usersToRemind: { type: Schema.Types.ObjectId, ref: ModelName.USER },
    onModel: { type: String, required: true, enum: Remindable },
    remindOf: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'onModel',
    },
  },
  { timestamps: true },
)

export const ReminderModel = mongoose.model<IRemindable>(ModelName.COMMENT, reminderSchema)
