import mongoose from 'mongoose'
import { Typegoose, prop, Ref } from 'typegoose'
import { User } from './User'

export class Post extends Typegoose {
  @prop({ required: true })
  name: string
  @prop({ required: true, ref: User })
  creator: Ref<User>
  // @prop({ref:})
}

export const PostModel = new Post().getModelForClass(Post, {
  schemaOptions: {
    timestamps: true,
  },
  existingMongoose: mongoose,
})
