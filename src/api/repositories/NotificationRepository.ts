import { Service } from 'typedi'
import { INotification, NotificationModel } from '../database/models/Notification'
import { IUser } from '../database/models/User'
import { getRelativeUserProfileLink } from '../misc/Links'
import { EventDispatcher } from 'event-dispatch'
import { INotificationSent } from '../app_models/event_dispatch/INotificationSent'
import { ModelName } from '../../constants/ModelName'

@Service()
export class NotificationRepository {
  public async saveViaUser(text: string, emitter: IUser, receiverId: string) {
    const notification = await new NotificationModel({
      text: `Imate novi friend request od ${emitter.username}.`,
      relativeLink: getRelativeUserProfileLink(emitter.id),
      emitter: emitter.id,
      emitterOnModel: ModelName.USER,
      receiver: receiverId,
    }).save()
    const eventDispatcher = new EventDispatcher()
    eventDispatcher.dispatch('notificationSent', {
      notification,
      userFrom: emitter,
      receiverId,
    } as INotificationSent)
    return notification
  }
}
