import mongoose, { Document, Schema } from 'mongoose'
import { IUser } from './User'
import { ModelName } from '../../../constants/ModelName'
import { ISection } from './Section'
import { IEvent } from './Event'
import { IComment, CommentModel, commentSchema } from './Comment'
import mongoosePaginate = require('mongoose-paginate')

export interface IPost extends Document {
  title: string
  description: string
  creator: IUser | number
  comments?: IComment[]
  section: ISection | number
}

export const POST_DISCRIMINATOR_KEY = 'type'
export enum PostTypes {
  EVENT = 'EventPost',
  TEXT_POST = 'TextPost',
}

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: ModelName.USER },
    section: { type: Schema.Types.ObjectId, ref: ModelName.SECTION },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
)
postSchema.plugin(mongoosePaginate)

postSchema.virtual('comments', {
  ref: ModelName.COMMENT,
  localField: '_id',
  foreignField: 'commented',
  justOne: false,
  options: { sort: { createdAt: -1 }, limit: 10, where: { onModel: ModelName.POST } },
})

export const PostModel = mongoose.model<IPost>(ModelName.POST, postSchema)
