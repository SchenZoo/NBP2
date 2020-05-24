import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { ModelName } from '../../../constants/ModelName';
import { ISection } from './Section';
import { IEvent } from './Event';
import { IComment, CommentModel, commentSchema } from './Comment';

export interface IPost extends Document {
  title: string;
  text: string;
  user: IUser | string;
  comments?: IComment[];
  section: ISection | string;
  __t: string;
}

export const POST_DISCRIMINATOR_KEY = 'type';
export enum PostTypes {
  EVENT = 'EventPost',
  TEXT_POST = 'TextPost',
}

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    text: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: ModelName.USER },
    section: { type: Schema.Types.ObjectId, ref: ModelName.SECTION },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

postSchema.virtual('comments', {
  ref: ModelName.COMMENT,
  localField: '_id',
  foreignField: 'commented',
  justOne: false,
  options: { sort: { createdAt: -1 }, limit: 10, where: { onModel: ModelName.POST } },
});

export const PostModel = mongoose.model<IPost>(ModelName.POST, postSchema);

export const TextPostModel = PostModel.discriminator<IPost>(PostTypes.TEXT_POST, new Schema());
