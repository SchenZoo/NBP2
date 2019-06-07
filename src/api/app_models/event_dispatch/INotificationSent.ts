import { IUser } from '../../database/models/User'
import { INotification } from '../../database/models/Notification'

export interface INotificationSent {
  userFrom: IUser
  receiverId: string
  notification: INotification
}
