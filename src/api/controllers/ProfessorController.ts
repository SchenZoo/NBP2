import { CACHE_KEYS } from './../../constants/CacheKeys';
import { IMongooseQuery } from "./../app_models/mongoose/IMongooseQuery";
import {
  JsonController,
  UseBefore,
  Get,
  QueryParams,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from "routing-controllers";
import { checkRole } from "../middlewares/AuthorizationMiddlewares";
import { RoleNames } from "../../constants/RoleNames";
import { passportJwtMiddleware } from "../middlewares/PassportJwtMiddleware";
import { PaginationSearch } from "../misc/QueryPagination";
import { UserModel, IUser } from "../database/models/User";
import { UserValidator } from "../validators/UserValidator";
import { hashPassowrd } from "../misc/Hash";
import { FileService } from "../services/FileService";
import {
  ModelImagePath,
  getAbsoluteServerPath,
} from "../../constants/ModelImagePath";
import { ObjectFromParamNotFound } from "../errors/ObjectFromParamNotFound";
import { DefaultImage } from "../../constants/DefaultImages";

@JsonController("/professors")
@UseBefore(checkRole([RoleNames.ADMIN]))
@UseBefore(passportJwtMiddleware)
export class ProfessorController {
  constructor(private fileService: FileService) {}
  @Get()
  public async get(@QueryParams() query: PaginationSearch) {
    return (UserModel.find({
      username: { $regex: `${query.name ? query.name : ""}` },
      roles: RoleNames.PROFESSOR,
    }) as IMongooseQuery<IUser[]>)
      .sort({ createdAt: -1 })
      .paginate(query.skip, query.take)
      .cache();
  }

  @Post()
  public async create(
    @Body({ validate: { whitelist: true } }) professor: UserValidator
  ) {
    professor.roles = [RoleNames.PROFESSOR];
    professor.password = hashPassowrd(professor.password);
    if (professor.imageBase64) {
      professor.imageURL = await this.fileService.addBase64Image(
        professor.imageBase64,
        ModelImagePath.USER_PROFILE
      );
    }

    return await new UserModel(professor).save();
  }

  @Put("/:id")
  public async update(
    @Body({ validate: { whitelist: true, skipMissingProperties: true } })
    newProfa: UserValidator,
    @Param("id") id: string
  ) {
    if (newProfa.password) {
      newProfa.password = hashPassowrd(newProfa.password);
    }
    if (newProfa.imageBase64) {
      const professor = await UserModel.findById(id);
      if (!professor) {
        throw new ObjectFromParamNotFound("User", id);
      }
      if (!professor.imageURL.includes(DefaultImage.USER_PROFILE)) {
        await this.fileService.removeFile(
          getAbsoluteServerPath(professor.toObject({ getters: false }).imageURL)
        );
      }
      newProfa.imageURL = await this.fileService.addBase64Image(
        newProfa.imageBase64,
        ModelImagePath.USER_PROFILE
      );
    }
    return UserModel.findByIdAndUpdate(id, newProfa, { new: true });
  }

  @Delete("/:id")
  public async delete(@Param("id") id: string) {
    const professor = await (UserModel.findById(id) as IMongooseQuery<
      IUser
    >).cache({ cacheKey: CACHE_KEYS.ITEM_USER(id) });
    if (!professor || professor.hasRoles([RoleNames.ADMIN])) {
      throw new ObjectFromParamNotFound("User", id);
    }
    if (
      professor.imageURL &&
      !professor.imageURL.includes(DefaultImage.USER_PROFILE)
    ) {
      this.fileService
        .removeFile(
          getAbsoluteServerPath(professor.toObject({ getters: false }).imageURL)
        )
        .catch((error) => console.error(error));
    }
    return professor.remove();
  }
}
