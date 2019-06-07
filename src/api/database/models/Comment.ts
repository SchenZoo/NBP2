import mongoose, { Document, Schema, model } from 'mongoose'
import { IUser } from './User'
import { ModelName } from '../../../constants/ModelName'
import { IPost } from './Post'
import { IEvent } from './Event'
import mongoosePaginate = require('mongoose-paginate')

export interface IComment extends Document {
  text: string
  creator: IUser | number
  commented: IPost | IEvent | number
  onModel: Commentable
  imageUrl: string
}

export enum Commentable {
  Post = ModelName.POST,
}

export const commentSchema = new Schema(
  {
    text: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    onModel: { type: String, required: true },
    commented: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'onModel',
    },
    imageUrl: {
      type: String,
      get: url => (url ? `${process.env.APP_HOST}:${process.env.APP_PORT}/public/${url}` : null),
    },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } },
)
commentSchema.plugin(mongoosePaginate)

export const CommentModel = mongoose.model<IComment>(ModelName.COMMENT, commentSchema)
