import mongoose, { Document, Schema } from 'mongoose'
import { ModelName } from '../../../constants/ModelName'
import { IUser } from './User'
import mongoosePaginate = require('mongoose-paginate')

export interface ISection extends Document {
  name: string
  creator: IUser | number
  imageUrl: string
}

const sectionSchema = new Schema(
  {
    name: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: ModelName.USER },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true },
)
sectionSchema.plugin(mongoosePaginate)

export const SectionModel = mongoose.model<ISection>(ModelName.SECTION, sectionSchema)
