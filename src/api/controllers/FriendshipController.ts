import { JsonController, UseBefore, Get, QueryParams, CurrentUser, Post, Param, Delete } from 'routing-controllers';
import { passportJwtMiddleware } from '../middlewares/PassportJwtMiddleware';
import { Pagination } from '../misc/QueryPagination';
import { IUser } from '../database/models/User';
import { FriendshipModel } from '../database/models/Friendship';
import { FriendRequestModel } from '../database/models/FriendRequest';
import { ConflictError } from '../errors/ConflictError';
import { NotificationRepository } from '../repositories/NotificationRepository';

@JsonController('/friends')
@UseBefore(passportJwtMiddleware)
export class FriendshipController {
  constructor(private notifyRepo: NotificationRepository) {}
  @Get()
  public async getAll(@QueryParams() query: Pagination, @CurrentUser() user: IUser) {
    const friendships = await FriendshipModel.paginate(
      { $or: [{ mario: user.id }, { luigi: user.id }] },
      {
        sort: { createdAt: -1 },
        limit: query.take,
        offset: query.skip,
        populate: ['mario', 'luigi'],
      },
    );
    return { ...friendships, docs: friendships.docs.map(friendship => ((friendship.luigi as IUser).id === user.id ? friendship.mario : friendship.luigi)) };
  }

  @Delete('/:id')
  public async delete(@Param('id') id: string) {
    return FriendshipModel.findByIdAndDelete(id);
  }
}
