import { IUser } from './User'
import mongoose, { Document, Schema } from 'mongoose'
import { ModelName } from '../../../constants/ModelName'

export interface IWebPushSubscription extends Document {
  token: string
  user: IUser | string
}

export const webPushSubSchema = new Schema(
  {
    token: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

export const WebPushSubModel = mongoose.model<IWebPushSubscription>(ModelName.WEBPUSH_SUBSCRIPTION, webPushSubSchema)
