import { JsonController, UseBefore, Get, QueryParams, CurrentUser, Post, Param, Delete } from 'routing-controllers'
import { passportJwtMiddleware } from '../middlewares/PassportJwtMiddleware'
import { Pagination } from '../misc/QueryPagination'
import { IUser } from '../database/models/User'
import { FriendshipModel } from '../database/models/Friendship'
import { FriendRequestModel } from '../database/models/FriendRequest'
import { ConflictError } from '../errors/ConflictError'
import { NotificationRepository } from '../repositories/NotificationRepository'

@JsonController('/friends')
@UseBefore(passportJwtMiddleware)
export class FriendshipController {
  constructor(private notifyRepo: NotificationRepository) {}
  @Get()
  public async getAll(@QueryParams() query: Pagination, @CurrentUser() user: IUser) {
    return FriendshipModel.paginate(
      { $or: [{ mario: user.id }, { luigi: user.id }] },
      {
        sort: { createdAt: -1 },
        limit: query.take,
        offset: query.skip,
        populate: ['mario', 'luigi'],
      },
    )
  }

  @Post('/:id')
  public async create(@CurrentUser() user: IUser, @Param('id') id: string) {
    const friendRequest = await FriendRequestModel.findOne({ $or: [{ sender: id, receiver: user.id }, { sender: user.id, receiver: id }] })
    if (friendRequest) {
      friendRequest.remove()
      const friendship = await FriendshipModel.findOne().or([{ mario: user.id, luigi: id }, { mario: id, luigi: user.id }])
      if (!friendship) {
        this.notifyRepo.saveViaUser(`${user.username} je prihvatio zahtev za prijateljstvo.`, user, id)
        return await new FriendshipModel({ mario: id, luigi: user.id }).save()
      } else {
        throw new ConflictError('Bratici mario i luigi su vec braca prijatelji!')
      }
    } else {
      throw new ConflictError('No friend request sent.')
    }
  }

  @Delete('/:id')
  public async delete(@Param('id') id: string) {
    return FriendshipModel.findByIdAndDelete(id)
  }
}
