import {
  passportJwtMiddleware,
  passportJwtAnonymousMiddleware,
} from "./../middlewares/PassportJwtMiddleware";
import { FriendRepository } from "./../repositories/FriendRepository";
import { RoleNames } from "./../../constants/RoleNames";
import { IUserPolictyRequest } from "./../policy/UserPolicy";
import { BASE_POLICY_NAMES } from "./../policy/BasePolicy";
import {
  policyCheck,
  checkRole,
} from "./../middlewares/AuthorizationMiddlewares";
import { CACHE_KEYS } from "./../../constants/CacheKeys";
import {
  getAbsoluteServerPath,
  ModelImagePath,
} from "./../../constants/ModelImagePath";
import { FileService } from "./../services/FileService";
import { DefaultImage } from "./../../constants/DefaultImages";
import {
  JsonController,
  Param,
  CurrentUser,
  Get,
  Put,
  Body,
  UseBefore,
  Req,
  QueryParams,
  Delete,
  Post,
} from "routing-controllers";
import { IUser, UserModel } from "../database/models/User";
import { UserValidator } from "../validators/UserValidator";
import { hashPassowrd } from "../misc/Hash";
import { UserPolicy } from "../policy/UserPolicy";
import { PaginationSearch } from "../misc/QueryPagination";
import { ObjectFromParamNotFound } from "../errors/ObjectFromParamNotFound";

@JsonController("/users")
export class UserController {
  constructor(
    private fileService: FileService,
    private friendRepo: FriendRepository
  ) {}

  @Get("/participants")
  @UseBefore(checkRole([RoleNames.ADMIN, RoleNames.PROFESSOR]))
  @UseBefore(passportJwtMiddleware)
  public async getParticipantsPaginated(
    @QueryParams() query: PaginationSearch
  ) {
    return UserModel.find({
      username: { $regex: `${query.name ? query.name : ""}` },
      roles: RoleNames.PARTICIPANT,
    })
      .sort({ createdAt: -1 })
      .paginate(query.skip, query.take)
      .cache();
  }

  @Get("/")
  @UseBefore(checkRole([RoleNames.ADMIN, RoleNames.PROFESSOR]))
  @UseBefore(passportJwtMiddleware)
  public async getAll(@QueryParams() query: PaginationSearch) {
    return UserModel.find({
      username: { $regex: `${query.name ? query.name : ""}` },
    })
      .sort({ createdAt: -1 })
      .paginate(query.skip, query.take)
      .cache();
  }

  @Get("/:id([a-z0-9]{24})")
  @UseBefore(passportJwtAnonymousMiddleware)
  public async get(@Param("id") id: string, @CurrentUser() user?: IUser) {
    const [gettingUser, friendRequest, friendship] = await Promise.all([
      UserModel.findById(id).cache({ cacheKey: CACHE_KEYS.ITEM_USER(id) }),
      user
        ? this.friendRepo.findFriendRequestBetweenUsers(user.id, id)
        : Promise.resolve(undefined),
      user
        ? this.friendRepo.findFriendshipBetweenUsers(user.id, id)
        : Promise.resolve(undefined),
    ]);

    return { user: gettingUser, friendRequest, friendship };
  }

  @Post()
  @UseBefore(checkRole([RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async create(
    @Body({ validate: { whitelist: true } }) participant: UserValidator
  ) {
    participant.roles = [RoleNames.PARTICIPANT];
    participant.password = hashPassowrd(participant.password);
    if (participant.imageBase64) {
      participant.imageURL = await this.fileService.addBase64Image(
        participant.imageBase64,
        ModelImagePath.USER_PROFILE
      );
    }

    return new UserModel(participant).save();
  }

  @Put("/:id")
  @UseBefore(policyCheck(BASE_POLICY_NAMES.UPDATE, UserPolicy))
  @UseBefore(passportJwtMiddleware)
  public async update(
    @Body({ validate: { skipMissingProperties: true, whitelist: true } })
    updatedUser: UserValidator,
    @Param("id") id: string
  ) {
    if (updatedUser.password) {
      updatedUser.password = hashPassowrd(updatedUser.password);
    }
    if (updatedUser.imageBase64) {
      updatedUser.imageURL = await this.fileService.addBase64Image(
        updatedUser.imageBase64,
        ModelImagePath.USER_PROFILE
      );
    }
    return UserModel.findByIdAndUpdate(id, updatedUser, { new: true });
  }

  @Delete("/:id")
  @UseBefore(policyCheck(BASE_POLICY_NAMES.DELETE, UserPolicy))
  @UseBefore(passportJwtMiddleware)
  public async delete(
    @Req() request: IUserPolictyRequest,
    @Param("id") id: string
  ) {
    const user = request.requestUser;
    if (!user || user.hasRoles([RoleNames.ADMIN, RoleNames.PROFESSOR])) {
      throw new ObjectFromParamNotFound("User", id);
    }
    return user.remove();
  }
}
