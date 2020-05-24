import { Document, Schema, model } from 'mongoose';
import { ModelName } from '../../../constants/ModelName';
import { IUser } from './User';

export interface INotification extends Document {
  text: string;
  relativeLink: string;
  emitter: IUser | string;
  receiver: IUser | string;
  openedAt: Date;
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
    emitterOnModel: {
      type: String,
      required() {
        return (this as any).emitter;
      },
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    openedAt: { type: Date, required: false },
  },
  { timestamps: true },
);

export const NotificationModel = model<INotification>(ModelName.NOTIFICATION, notificationSchema);
