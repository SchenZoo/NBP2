import { Typegoose, prop, Ref } from 'typegoose'
import { User } from './User'
import mongoose from 'mongoose'

export class Event extends Typegoose {
  @prop({ required: true })
  name: string
  @prop({ required: true, ref: User })
  creator: Ref<User>
  @prop({ required: true })
  description: string
  @prop({ required: false })
  location: {
    latitude: number
    longitude: number
  }
  @prop()
  time: {
    startsAt: Date
    endsAt: Date
  }
}

export const EventModel = new Event().getModelForClass(Event, {
  schemaOptions: {
    timestamps: true,
  },
  existingMongoose: mongoose,
})
