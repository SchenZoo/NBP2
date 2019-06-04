import { JsonController, Get, UseBefore, QueryParams, Post, Body, Put, Param, Delete, BodyParam, CurrentUser, Params } from 'routing-controllers'
import { passportJwtMiddleware } from '../middlewares/PassportJwtMiddleware'
import { Pagination } from '../misc/QueryPagination'
import { PostModel, PostTypes } from '../database/models/Post'
import { checkRole, policyCheck } from '../middlewares/AuthorizationMiddlewares'
import { RoleNames } from '../../constants/RoleNames'
import { PostValidator } from '../validators/PostValidator'
import { BASE_POLICY_NAMES } from '../policy/BasePolicy'
import { PostPolicy } from '../policy/PostPolicy'
import { EventModel } from '../database/models/Event'
import { IUser } from '../database/models/User'

@JsonController('/post')
export class PostController {
  @Get()
  @Get('/:sectionId')
  public async get(@QueryParams() query: Pagination, @Param('sectionId') sectionId?: number) {
    const posts = PostModel.find()
      .sort({ createdAt: -1 })
      .populate('creator')
      .populate('comments')
    if (sectionId) {
      return posts.where({ section: sectionId })
    }
    return posts
  }

  @Post('/:id')
  @UseBefore(checkRole([RoleNames.PROFESSOR, RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async create(
    @BodyParam('post', { validate: false, required: true }) post: any,
    @BodyParam('type', { required: true }) type: string,
    @Param('id') id: string,
    @CurrentUser() user: IUser,
  ) {
    post.creator = user
    post.section = id
    switch (type) {
      case PostTypes.EVENT:
        return await new EventModel(post).save()
      default:
        return await new PostModel(post).save()
    }
  }

  @Put('/:id')
  @UseBefore(policyCheck(BASE_POLICY_NAMES.UPDATE, PostPolicy))
  @UseBefore(checkRole([RoleNames.PROFESSOR, RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async update(
    @BodyParam('post', { validate: false, required: true }) post: any,
    @BodyParam('type', { required: true }) type: string,
    @Param('id') id: string,
  ) {
    switch (type) {
      case PostTypes.EVENT:
        return EventModel.updateOne({ id }, post)
      default:
        return PostModel.updateOne({ id }, post)
    }
  }

  @Delete('/:id')
  @UseBefore(policyCheck(BASE_POLICY_NAMES.UPDATE, PostPolicy))
  @UseBefore(checkRole([RoleNames.PROFESSOR, RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async delete(@Param('id') id: string) {
    return PostModel.deleteOne({ id })
  }
}
