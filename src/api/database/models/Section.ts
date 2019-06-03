import { Typegoose, prop, Ref } from 'typegoose'
import { User } from './User'
import mongoose from 'mongoose'

export class Section extends Typegoose {
  @prop({ required: true })
  name: string
  @prop({ required: true, ref: User })
  creator: Ref<User>
}

export const SectionModel = new Section().getModelForClass(Section, {
  schemaOptions: {
    timestamps: true,
  },
  existingMongoose: mongoose,
})
