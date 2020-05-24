import { removeMongoCacheByModel } from './../middlewares/cache/ModelCacheClearMiddleware';
import { IUserPolictyRequest } from "./../policy/UserPolicy";
import { BASE_POLICY_NAMES } from "./../policy/BasePolicy";
import { policyCheck } from "./../middlewares/AuthorizationMiddlewares";
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
} from "routing-controllers";
import { IUser, UserModel } from "../database/models/User";
import { FriendRequestModel } from "../database/models/FriendRequest";
import { FriendshipModel } from "../database/models/Friendship";
import { UserValidator } from "../validators/UserValidator";
import { hashPassowrd } from "../misc/Hash";
import { UserPolicy } from "../policy/UserPolicy";

@JsonController("/users")
export class UserController {
  constructor(private fileService: FileService) {}
  @Get("/:id")
  public async get(@Param("id") id: string, @CurrentUser() user: IUser) {
    const [gettingUser, friendRequest, friendship] = await Promise.all([
      UserModel.findById(id).cache({ cacheKey: CACHE_KEYS.ITEM_USER(id) }),
      FriendRequestModel.findOne().or([
        { sender: id, receiver: user.id },
        { sender: user.id, receiver: id },
      ]),
      FriendshipModel.findOne().or([
        { mario: id, luigi: user.id },
        { mario: user.id, luigi: id },
      ]),
    ]);

    return { user: gettingUser, friendRequest, friendship };
  }

  @Put("/:id")
  @UseBefore(policyCheck(BASE_POLICY_NAMES.UPDATE, UserPolicy))
  public async update(
    @Body({ validate: { skipMissingProperties: true, whitelist: true } })
    updatedUser: UserValidator,
    @Param("id") id: string,
    @Req() request: IUserPolictyRequest
  ) {
    if (updatedUser.password) {
      updatedUser.password = hashPassowrd(updatedUser.password);
    }
    if (updatedUser.imageBase64) {
      const user = request.requestUser;
      if (!user.imageURL.includes(DefaultImage.USER_PROFILE)) {
        await this.fileService.removeFile(
          getAbsoluteServerPath(user.toObject({ getters: false }).imageURL)
        );
      }
      updatedUser.imageURL = await this.fileService.addBase64Image(
        updatedUser.imageBase64,
        ModelImagePath.USER_PROFILE
      );
    }
    return UserModel.findByIdAndUpdate(id, updatedUser, { new: true });
  }
}
