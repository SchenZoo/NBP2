import mongoose, { Document, Schema } from 'mongoose';
import { ModelName } from '../../../constants/ModelName';
import { IUser } from './User';

export interface IRemindable extends Document {
  usersToRemind: IUser;
}

const reminderSchema = new Schema(
  {
    usersToRemind: { type: Schema.Types.ObjectId, ref: 'User' },
    onModel: { type: String, required: true },
    remindOf: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'onModel',
    },
  },
  { timestamps: true },
);

export const ReminderModel = mongoose.model<IRemindable>(ModelName.REMINDER, reminderSchema);
