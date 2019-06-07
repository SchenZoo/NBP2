import { IChatSession } from '../../database/models/ChatSession'
import { IMessage } from '../../database/models/Message'
import { IUser } from '../../database/models/User'

export interface IPrivateMessageSent {
  sender: IUser
  receiverId: string
  session: IChatSession
  message: IMessage
}
