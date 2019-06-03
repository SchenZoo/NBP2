import { IUser } from './User'
import mongoose, { Document, Schema } from 'mongoose'
import { ModelName } from '../../../constants/ModelName'
import { locationSchema, ILocation } from './Location'
import { PostModel, POST_DISCRIMINATOR_KEY, PostTypes } from './Post'

export interface IEvent extends Document {
  title: string
  description: string
  creator: IUser | number
  location?: ILocation
  startsAt?: Date
  endsAt?: Date
}

const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: ModelName.USER },
    startsAt: { type: Date, required: false },
    endsAt: { type: Date, required: false },
    location: locationSchema,
  },
  { discriminatorKey: POST_DISCRIMINATOR_KEY },
)

export const EventModel = PostModel.discriminator<IEvent>(PostTypes.EVENT, eventSchema)
