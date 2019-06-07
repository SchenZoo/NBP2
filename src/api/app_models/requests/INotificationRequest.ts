import { Request } from 'express'
import { INotification } from '../../database/models/Notification'

export interface INotificationRequest extends Request {
  notification: INotification
}
