import { Service } from "typedi";
import { NotificationModel } from "../database/models/Notification";
import { IUser } from "../database/models/User";
import { getRelativeUserProfileLink } from "../misc/Links";
import { EventDispatcher } from "event-dispatch";
import { ModelName } from "../../constants/ModelName";

@Service()
export class NotificationRepository {
  public async saveViaUser(text: string, emitter: IUser, receiverId: string) {
    const notification = await new NotificationModel({
      text,
      relativeLink: getRelativeUserProfileLink(emitter.id),
      emitter: emitter.id,
      emitterOnModel: ModelName.USER,
      receiver: receiverId,
    }).save();
    const eventDispatcher = new EventDispatcher();
    eventDispatcher.dispatch("notificationSent", {
      notification,
      userFrom: emitter,
      receiverId,
    });
    return notification;
  }
}
