import { Schema } from 'mongoose'

export interface ILocation {
  latitude: number
  longitude: number
  address: string
}

export const locationSchema = new Schema({
  latitude: { type: Number },
  longitude: { type: Number },
  address: { type: String },
})
