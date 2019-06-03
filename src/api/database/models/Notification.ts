import { Document, Schema, model } from 'mongoose'
import { ModelName } from '../../../constants/ModelName'
import { IUser } from './User'

export interface INotification extends Document {
  text: string
  relativeLink: string
  emitter: IUser | number
  receiver: IUser | number
  openedAt: Date
}

const notificationSchema = new Schema(
  {
    text: { type: String, required: true },
    relativeLink: { type: String, required: true },
    emitter: {
      type: Schema.Types.ObjectId,
      required: false,
      refPath: 'emitterOnModel',
    },
    emitterOnModel: { type: String, required: true },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
)

export const NotificationModel = model<INotification>(ModelName.NOTIFICATION, notificationSchema)
