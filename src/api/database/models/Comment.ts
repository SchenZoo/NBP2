import mongoose, { Document, Schema, model } from 'mongoose'
import { IUser } from './User'
import { ModelName } from '../../../constants/ModelName'
import { IPost } from './Post'
import { IEvent } from './Event'

export interface IComment extends Document {
  name: string
  creator: IUser | number
  commented: IPost | IEvent | number
  onModel: Commentable
}

export enum Commentable {
  Post = ModelName.POST,
}

export const commentSchema = new Schema(
  {
    name: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    onModel: { type: String, required: true },
    commented: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'onModel',
    },
  },
  { timestamps: true },
)

export const CommentModel = mongoose.model<IComment>(ModelName.COMMENT, commentSchema)
