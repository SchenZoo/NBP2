import { IUser } from "../../database/models/User";
import { INotification } from "../../database/models/Notification";

export interface INotificationSent {
  receiverId: string;
  notification: INotification;
}
