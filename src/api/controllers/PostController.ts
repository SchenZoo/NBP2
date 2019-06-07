import {
  JsonController,
  Get,
  UseBefore,
  QueryParams,
  Post,
  Body,
  Put,
  Param,
  Delete,
  BodyParam,
  CurrentUser,
  Params,
  Req,
  Controller,
} from 'routing-controllers'
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
import { CommentModel, IComment } from '../database/models/Comment'
import { ModelName } from '../../constants/ModelName'
import { CommentValidator } from '../validators/CommentValidator'
import { ModelImagePath } from '../../constants/ModelImagePath'
import { FileService } from '../services/FileService'
import { plainToClass } from 'class-transformer'

@JsonController('/post')
export class PostController {
  constructor(private fileService: FileService) {}
  @Get()
  @Get('/:sectionId')
  public async get(@QueryParams() query: Pagination, @Param('sectionId') sectionId?: number) {
    query = plainToClass(Pagination, query)
    let findOptions = {}
    if (sectionId) {
      findOptions = { section: sectionId }
    }
    const data = await PostModel.paginate(findOptions, {
      sort: { createdAt: -1 },
      limit: query.take,
      offset: query.skip,
      populate: {
        path: 'comments',
        populate: 'creator',
      },
    })
    return data
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

  @Post('/:id/comment')
  @UseBefore(passportJwtMiddleware)
  public async addComment(@CurrentUser() user: IUser, @Body() comment: CommentValidator, @Param('id') id: number) {
    if (comment.imageBase64) {
      comment.imageUrl = await this.fileService.addBase64Image(comment.imageBase64, ModelImagePath.USER_PROFILE)
    }
    return new CommentModel({ text: comment.text, creator: user, modelName: ModelName.POST, commented: id, imageUrl: comment.imageUrl } as IComment).save()
  }
}
