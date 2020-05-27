import { ChatSessionModel } from "./../../database/models/ChatSession";
import { Service } from "typedi";
import { IChatSession } from "../../database/models/ChatSession";
import { MessageModel } from "../../database/models/Message";
import { EventDispatcher } from "event-dispatch";
import { ChatMessageValidator } from "../../validators/ChatMessageValidator";
import { IUser } from "../../database/models/User";

@Service()
export class MessageService {
  async addMessage(
    sender: IUser,
    session: IChatSession,
    chatMessage: ChatMessageValidator
  ) {
    const message = await new MessageModel({
      text: chatMessage.text,
      files: chatMessage.files,
      data: chatMessage.data,
      onModel: chatMessage.onModel,
      session: session.id,
      sender: sender.id,
      ref: chatMessage.ref,
    }).save();
    const dataPreparationPromises: Array<Promise<any>> = [];
    if (message.data) {
      dataPreparationPromises.push(message.populate("data").execPopulate());
    }
    if (!session.populated("participants")) {
      dataPreparationPromises.push(
        session.populate("participants").execPopulate()
      );
    }
    await Promise.all(dataPreparationPromises);

    ChatSessionModel.updateOne(
      { _id: session._id },
      {
        lastMessage: {
          ...message.toObject({ getters: true, virtuals: true }),
          sender,
        },
      }
    ).exec();

    const eventDispatcher = new EventDispatcher();
    eventDispatcher.dispatch("privateMessageSent", {
      sender,
      session,
      message,
    });
    return message;
  }
}
