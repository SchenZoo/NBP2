import mongoose, { Document, Schema, model } from "mongoose";
import { IUser } from "./User";
import { ModelName } from "../../../constants/ModelName";
import { IPost } from "./Post";
import { IEvent } from "./Event";
import mongoosePaginate = require("mongoose-paginate");
import { getModelImageUrl } from "../../../constants/ModelImagePath";

export interface IComment extends Document {
  text: string;
  user: IUser | string;
  commented: IPost | IEvent | string;
  onModel: Commentable;
  imageURL: string;
}

export enum Commentable {
  Post = ModelName.POST,
}

export const commentSchema = new Schema(
  {
    text: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    onModel: { type: String, required: true },
    commented: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "onModel",
    },
    imageURL: {
      type: String,
      get: (imageName) => getModelImageUrl(imageName),
    },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);
commentSchema.plugin(mongoosePaginate);

export const CommentModel = mongoose.model<IComment>(
  ModelName.COMMENT,
  commentSchema
);
