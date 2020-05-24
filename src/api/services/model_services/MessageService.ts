import { Service } from "typedi";
import { IChatSession } from "../../database/models/ChatSession";
import { MessageModel, IMessage } from "../../database/models/Message";
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
    if (!session.populated("participants")) {
      await session.populate("participants").execPopulate();
    }
    const message = await new MessageModel({
      text: chatMessage.text,
      files: chatMessage.files,
      data: chatMessage.data,
      onModel: chatMessage.onModel,
      session: session.id,
      sender: sender.id,
      ref: chatMessage.ref,
    }).save();
    const eventDispatcher = new EventDispatcher();
    eventDispatcher.dispatch("privateMessageSent", {
      sender,
      session,
      message,
    });
    return message;
  }
}
