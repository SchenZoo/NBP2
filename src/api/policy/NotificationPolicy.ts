import { BasePolicy } from './BasePolicy';
import { NotificationModel } from '../database/models/Notification';
import { ObjectFromParamNotFound } from '../errors/ObjectFromParamNotFound';
import { request } from 'http';
import { INotificationRequest } from '../app_models/requests/INotificationRequest';

export class NotificationPolicy extends BasePolicy {
  public async default(): Promise<boolean> {
    const notification = await NotificationModel.findById(this.request.params.id);
    if (!notification) {
      throw new ObjectFromParamNotFound('Notification', this.request.params.id);
    }
    (this.request as INotificationRequest).notification = notification;
    return this.request.params.receiver === this.user.id;
  }
}
