import mongoose, { Document, Schema } from 'mongoose'
import { User } from './User'
import { Post } from './Post'
import { Section } from './Section'
import { ModelName } from '../../../constants/ModelName'

export interface IComment extends Document {
  name: string
  creator: User | number
  commented: Post | Section | number
  onModel: string
}

enum Commentable {
  Post = ModelName.POST,
  Section = ModelName.SECTION,
}

const commentSchema = new Schema(
  {
    name: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: ModelName.USER },
    onModel: { type: String, required: true, enum: Commentable },
    commented: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'onModel',
    },
  },
  { timestamps: true },
)

export const CommentModel = mongoose.model<IComment>(ModelName.COMMENT, commentSchema)
