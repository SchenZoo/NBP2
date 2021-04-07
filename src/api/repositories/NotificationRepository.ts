import { Service } from "typedi";
import { NotificationModel } from "../database/models/Notification";
import { IUser } from "../database/models/User";
import { getRelativeUserProfileLink, getRelativePostLink } from "../misc/Links";
import { EventDispatcher } from "event-dispatch";
import { ModelName } from "../../constants/ModelName";
import { IPost } from "../database/models/Post";

@Service()
export class NotificationRepository {
  eventDispatcher: EventDispatcher;
  constructor() {
    this.eventDispatcher = new EventDispatcher();
  }
  public async saveViaUser(text: string, emitter: IUser, receiverId: string) {
    const notification = await new NotificationModel({
      text,
      relativeLink: getRelativeUserProfileLink(emitter.id),
      emitter: emitter.id,
      emitterOnModel: ModelName.USER,
      receiver: receiverId,
    }).save();

    await notification.populate("emitter").execPopulate();

    this.eventDispatcher.dispatch("notificationSent", {
      notification,
      receiverId,
    });

    return notification;
  }

  public async saveViaPost(
    text: string,
    post: IPost,
    creator: IUser,
    receiverId: string
  ) {
    const notification = await new NotificationModel({
      text,
      relativeLink: getRelativePostLink(
        typeof post.section === "string" ? post.section : post.section._id,
        creator.id
      ),
      emitter: creator.id,
      emitterOnModel: ModelName.USER,
      receiver: receiverId,
    }).save();

    await notification.populate("emitter").execPopulate();

    this.eventDispatcher.dispatch("notificationSent", {
      notification,
      receiverId,
    });

    return notification;
  }
}
