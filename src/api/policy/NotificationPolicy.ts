import { BasePolicy } from "./BasePolicy";
import {
  NotificationModel,
  INotification,
} from "../database/models/Notification";
import { ObjectFromParamNotFound } from "../errors/ObjectFromParamNotFound";
import { Request } from "express";

export class NotificationPolicy extends BasePolicy {
  public async default(): Promise<boolean> {
    const { id } = this.request.params;
    const notification = await NotificationModel.findById(id);
    if (!notification) {
      throw new ObjectFromParamNotFound("Notification", id);
    }
    (this
      .request as INotificationPolicyRequest).requestNotification = notification;
    return `${notification.receiver}` === `${this.user.id}`;
  }
}

export interface INotificationPolicyRequest extends Request {
  requestNotification: INotification;
}
