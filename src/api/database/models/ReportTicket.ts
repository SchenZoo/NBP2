import mongoose, { Document, Schema, model, modelNames } from 'mongoose'
import { ModelName } from '../../../constants/ModelName'
import mongoosePaginate = require('mongoose-paginate')

export interface IReportTicket extends Document {
  text: string
  contactEmail: string
  contactName: string
}

const reportTicketSchema = new Schema(
  {
    text: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactName: { type: String, required: true },
  },
  { timestamps: true },
)
reportTicketSchema.plugin(mongoosePaginate)

export const ReportTicketModel = mongoose.model<IReportTicket>(ModelName.REPORT_TICKET, reportTicketSchema)
