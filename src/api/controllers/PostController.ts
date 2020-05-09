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
  CurrentUser,
  HttpError,
} from 'routing-controllers'
import { passportJwtMiddleware } from '../middlewares/PassportJwtMiddleware'
import { Pagination } from '../misc/QueryPagination'
import { PostModel, PostTypes, TextPostModel } from '../database/models/Post'
import { checkRole, policyCheck } from '../middlewares/AuthorizationMiddlewares'
import { RoleNames } from '../../constants/RoleNames'
import { BASE_POLICY_NAMES } from '../policy/BasePolicy'
import { PostPolicy } from '../policy/PostPolicy'
import { EventModel } from '../database/models/Event'
import { IUser } from '../database/models/User'
import { CommentModel } from '../database/models/Comment'
import { ModelName } from '../../constants/ModelName'
import { CommentValidator } from '../validators/CommentValidator'
import { ModelImagePath } from '../../constants/ModelImagePath'
import { FileService } from '../services/FileService'
import { plainToClass } from 'class-transformer'
import { PostValidator } from '../validators/PostValidator'

@JsonController('/sections')
export class PostController {
  constructor(private fileService: FileService) {}
  @Get('/:sectionId/posts')
  public async get(@QueryParams() query: Pagination, @Param('sectionId') sectionId: string) {
    query = plainToClass(Pagination, query)
    const data = await PostModel.paginate({ section: sectionId }, {
      sort: { createdAt: -1 },
      limit: query.take,
      offset: query.skip,
      populate: {
        path: 'comments',
        populate: 'user',
      },
    })
    data.docs.forEach(post => {
      if (post.comments) {
        post.comments.reverse()
      }
    })
    return data
  }

  @Post('/:id/posts')
  @UseBefore(checkRole([RoleNames.PROFESSOR, RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async create(@Body() body: PostValidator, @Param('id') id: string, @CurrentUser() user: IUser) {
    const post = body.post
    post.user = user.id
    post.section = id
    switch (body.type) {
      case PostTypes.EVENT:
        return await new EventModel(post).save()
      case PostTypes.TEXT_POST:
        return await new TextPostModel(post).save()
      default:
        return await new PostModel(post).save()
    }
  }

  @Put('/posts/:id')
  @UseBefore(policyCheck(BASE_POLICY_NAMES.UPDATE, PostPolicy))
  @UseBefore(checkRole([RoleNames.PROFESSOR, RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async update(@Body() body: PostValidator, @Param('id') id: string) {
    const post = body.post
    switch (body.type) {
      case PostTypes.EVENT:
        return EventModel.findByIdAndUpdate(id, post, { new: true })
      case PostTypes.TEXT_POST:
        return TextPostModel.findByIdAndUpdate(id, post, { new: true })
      default:
        throw new HttpError(500, 'This is bugish  :)')
    }
  }

  @Delete('/posts/:id')
  @UseBefore(policyCheck(BASE_POLICY_NAMES.UPDATE, PostPolicy))
  @UseBefore(checkRole([RoleNames.PROFESSOR, RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async delete(@Param('id') id: string) {
    return PostModel.findByIdAndDelete(id)
  }

  @Get('/posts/:id/comments')
  @UseBefore(passportJwtMiddleware)
  public async getComments(@Param('id') id: string, @QueryParams() query: Pagination) {
    const comments = await CommentModel.paginate(
      { commented: id, onModel: ModelName.POST },
      { limit: query.take, offset: query.skip, populate: 'user', sort: { createdAt: -1 } },
    )
    comments.docs.reverse()
    return comments
  }

  @Post('/posts/:id/comments')
  @UseBefore(passportJwtMiddleware)
  public async addComment(@CurrentUser() user: IUser, @Body() comment: CommentValidator, @Param('id') id: string) {
    if (comment.imageBase64) {
      comment.imageURL = await this.fileService.addBase64Image(comment.imageBase64, ModelImagePath.USER_PROFILE)
    }
    return new CommentModel({ text: comment.text, user, onModel: ModelName.POST, commented: id, imageURL: comment.imageURL }).save()
  }
}
