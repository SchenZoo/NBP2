import mongoose, { Document, Schema } from 'mongoose'
import { ModelName } from '../../../constants/ModelName'
import { IUser } from './User'
import mongoosePaginate = require('mongoose-paginate')

export interface ISection extends Document {
  name: string
  user: IUser | string
  imageURL: string
}

const sectionSchema = new Schema(
  {
    name: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: ModelName.USER },
    imageURL: { type: String, required: true },
  },
  { timestamps: true },
)
sectionSchema.plugin(mongoosePaginate)

export const SectionModel = mongoose.model<ISection>(ModelName.SECTION, sectionSchema)
