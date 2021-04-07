import { IPost } from "./../database/models/Post";
import { CommentPolicy } from "./../policy/CommentPolicy";
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
  Req,
} from "routing-controllers";
import { passportJwtMiddleware } from "../middlewares/PassportJwtMiddleware";
import { Pagination } from "../misc/QueryPagination";
import { PostModel, PostTypes, TextPostModel } from "../database/models/Post";
import {
  checkRole,
  policyCheck,
} from "../middlewares/AuthorizationMiddlewares";
import { RoleNames } from "../../constants/RoleNames";
import { BASE_POLICY_NAMES } from "../policy/BasePolicy";
import { PostPolicy } from "../policy/PostPolicy";
import { EventModel } from "../database/models/Event";
import { IUser } from "../database/models/User";
import { CommentModel } from "../database/models/Comment";
import { ModelName } from "../../constants/ModelName";
import { CommentValidator } from "../validators/CommentValidator";
import { ModelImagePath } from "../../constants/ModelImagePath";
import { FileService } from "../services/FileService";
import { plainToClass } from "class-transformer";
import { PostValidator } from "../validators/PostValidator";
import { ICommentPolicyRequest } from "../policy/CommentPolicy";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { SectionModel, SectionSubscriptionModel } from "../database/models";
import { CACHE_KEYS } from "../../constants/CacheKeys";

@JsonController("/sections")
export class PostController {
  constructor(
    private fileService: FileService,
    private notifyRepo: NotificationRepository
  ) {}
  @Get("/:sectionId/posts")
  public async get(
    @QueryParams() query: Pagination,
    @Param("sectionId") sectionId: string
  ) {
    query = plainToClass(Pagination, query);
    const data = await PostModel.find({ section: sectionId })
      .sort({ createdAt: -1 })
      .paginate(query.skip, query.take)
      .populate({
        path: "comments",
        populate: "user",
      })
      .populate("user");

    data.docs.forEach((post) => {
      if (post.comments) {
        post.comments.reverse();
      }
    });
    return data;
  }

  @Post("/:id/posts")
  @UseBefore(checkRole([RoleNames.PROFESSOR, RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async create(
    @Body() body: PostValidator,
    @Param("id") id: string,
    @CurrentUser() user: IUser
  ) {
    const post = body.post;
    post.user = user.id;
    post.section = id;

    let createdPost: IPost;
    switch (body.type) {
      case PostTypes.EVENT:
        createdPost = await new EventModel(post).save();
        break;
      case PostTypes.TEXT_POST:
        createdPost = await new TextPostModel(post).save();
        break;
      default:
        createdPost = await new PostModel(post).save();
        break;
    }

    (async () => {
      const section = await SectionModel.findById(id).cache({
        cacheKey: CACHE_KEYS.ITEM_SECTION(id),
      });

      if (!section) return;

      const sectionSubscriptions = await SectionSubscriptionModel.find({
        sectionId: id,
      }).lean();

      sectionSubscriptions.forEach((subscription) => {
        if (`${subscription.userId}` === `${user._id}`) return;
        this.notifyRepo.saveViaPost(
          `${user.name} je objavio post "${createdPost.title}" u sekciji ${section?.name}.`,
          createdPost,
          user,
          subscription.userId
        );
      });
    })();

    return createdPost.populate("user").execPopulate();
  }

  @Put("/posts/:id")
  @UseBefore(policyCheck(BASE_POLICY_NAMES.UPDATE, PostPolicy))
  @UseBefore(checkRole([RoleNames.PROFESSOR, RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async update(@Body() body: PostValidator, @Param("id") id: string) {
    const post = body.post;
    switch (body.type) {
      case PostTypes.EVENT:
        return EventModel.findByIdAndUpdate(id, post, { new: true })
          .populate({
            path: "comments",
            populate: "user",
          })
          .populate("user");
      case PostTypes.TEXT_POST:
        return TextPostModel.findByIdAndUpdate(id, post, { new: true })
          .populate({
            path: "comments",
            populate: "user",
          })
          .populate("user");
      default:
        throw new HttpError(500, "This is bugish  :)");
    }
  }

  @Delete("/posts/:id")
  @UseBefore(policyCheck(BASE_POLICY_NAMES.UPDATE, PostPolicy))
  @UseBefore(checkRole([RoleNames.PROFESSOR, RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async delete(@Param("id") id: string) {
    return PostModel.findByIdAndDelete(id);
  }

  @Get("/posts/:id/comments")
  @UseBefore(passportJwtMiddleware)
  public async getComments(
    @Param("id") id: string,
    @QueryParams() query: Pagination
  ) {
    const comments = await CommentModel.find({
      commented: id,
      onModel: ModelName.POST,
    })
      .sort({ createdAt: -1 })
      .paginate(query.skip, query.take);

    comments.docs.reverse();

    return comments;
  }

  @Post("/posts/:id/comments")
  @UseBefore(passportJwtMiddleware)
  public async addComment(
    @CurrentUser() user: IUser,
    @Body() comment: CommentValidator,
    @Param("id") id: string
  ) {
    if (comment.imageBase64) {
      comment.imageURL = await this.fileService.addBase64Image(
        comment.imageBase64,
        ModelImagePath.USER_PROFILE
      );
    }
    return new CommentModel({
      text: comment.text,
      user,
      onModel: ModelName.POST,
      commented: id,
      imageURL: comment.imageURL,
    }).save();
  }

  @Delete("/posts/comments/:id")
  @UseBefore(policyCheck(BASE_POLICY_NAMES.DELETE, CommentPolicy))
  @UseBefore(passportJwtMiddleware)
  public async deleteComment(@Req() req: ICommentPolicyRequest) {
    return req.requestComment.remove();
  }
}
