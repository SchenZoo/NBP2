import { JsonController, Param, CurrentUser, Get, QueryParams, Put, Body } from 'routing-controllers'
import { IUser, UserModel } from '../database/models/User'
import { FriendRequestModel } from '../database/models/FriendRequest'
import { FriendshipModel } from '../database/models/Friendship'
import { UserValidator } from '../validators/UserValidator'

@JsonController('/user')
export class UserController {
  @Get('/:id')
  public async get(@Param('id') id: string, @CurrentUser() user: IUser) {
    const fullFriend = Promise.all([
      UserModel.findById(id),
      FriendRequestModel.findOne().or([{ sender: id, receiver: user.id }, { sender: user.id, receiver: id }]),
      FriendshipModel.findOne().or([{ mario: id, luigi: user.id }, { mario: user.id, luigi: id }]),
    ])

    return { user: fullFriend[0], friendRequest: fullFriend[1], friendship: fullFriend[2] }
  }

  @Put()
  public async update(@Body({ validate: { skipMissingProperties: true, whitelist: true } }) updatedUser: UserValidator, @CurrentUser() user: IUser) {
    return UserModel.findByIdAndUpdate(user.id, updatedUser, { new: true })
  }
}
