import mongoose, { Document, Schema } from 'mongoose'
import { ModelName } from '../../../constants/ModelName'
import { IUser } from './User'

export interface ISection extends Document {
  name: string
  creator: IUser | number
}

const sectionSchema = new Schema(
  {
    name: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: ModelName.USER },
  },
  { timestamps: true },
)

export const SectionModel = mongoose.model<ISection>(ModelName.SECTION, sectionSchema)
