import { JsonController, Param, CurrentUser, Get } from 'routing-controllers'
import { IUser } from '../database/models/User'
import { FriendRequestModel } from '../database/models/FriendRequest'
import { FriendshipModel } from '../database/models/Friendship'

@JsonController('/user')
export class UserController {
  @Get('/:id')
  public async get(@Param('id') id: string, @CurrentUser() user: IUser) {
    const frequest = await FriendRequestModel.findOne().or([{ sender: id, receiver: user.id }, { sender: user.id, receiver: id }])
    const friendship = await FriendshipModel.findOne().or([{ mario: id, luigi: user.id }, { mario: user.id, luigi: id }])

    return { frequest, friendship }
  }
}
