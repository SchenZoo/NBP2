import { CACHE_KEYS } from "./../../constants/CacheKeys";
import { SectionModel, ISection } from "./../database/models/Section";
import {
  JsonController,
  UseBefore,
  Get,
  CurrentUser,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from "routing-controllers";
import { passportJwtMiddleware } from "../middlewares/PassportJwtMiddleware";
import { checkRole } from "../middlewares/AuthorizationMiddlewares";
import { RoleNames } from "../../constants/RoleNames";
import { SectionValidation } from "../validators/SectionValidator";
import { IUser } from "../database/models/User";
import { FileService } from "../services/FileService";
import {
  ModelImagePath,
  getAbsoluteServerPath,
} from "../../constants/ModelImagePath";
import { ObjectFromParamNotFound } from "../errors/ObjectFromParamNotFound";

@JsonController("/sections")
export class SectionController {
  constructor(private fileService: FileService) {}
  @Get()
  public async get() {
    return SectionModel.find().sort({
      createdAt: -1,
    }).cache();
  }

  @Get("/:id")
  public async getOne(@Param("id") id: string) {
    return SectionModel.findById(id).cache({
      cacheKey: CACHE_KEYS.ITEM_SECTION(id),
    });
  }

  @Post()
  @UseBefore(passportJwtMiddleware, checkRole([RoleNames.ADMIN]))
  public async create(
    @Body() section: SectionValidation,
    @CurrentUser() user: IUser
  ) {
    section.user = user;
    section.imageURL = await this.fileService.addBase64Image(
      section.imageBase64,
      ModelImagePath.SECTION
    );
    return new SectionModel(section).save();
  }

  @Put("/:id")
  @UseBefore(checkRole([RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async update(
    @Body({
      validate: { skipMissingProperties: true, whitelist: true },
      required: true,
    })
    section: SectionValidation,
    @Param("id") id: string
  ) {
    if (section.imageBase64) {
      const oldSection = await SectionModel.findById(id).cache({
        cacheKey: CACHE_KEYS.ITEM_SECTION(id),
      });
      if (!oldSection) {
        throw new ObjectFromParamNotFound("Section", id);
      }
      await this.fileService.removeFile(
        getAbsoluteServerPath(oldSection.toObject({ getters: false }).imageURL)
      );
      section.imageURL = await this.fileService.addBase64Image(
        section.imageBase64,
        ModelImagePath.SECTION
      );
    }
    return SectionModel.findByIdAndUpdate(id, section, { new: true });
  }

  @Delete("/:id")
  @UseBefore(checkRole([RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async delete(@Param("id") id: string) {
    const section = await SectionModel.findById(id).cache({
      cacheKey: CACHE_KEYS.ITEM_SECTION(id),
    });
    if (!section) {
      throw new ObjectFromParamNotFound("Section", id);
    }
    if (section.onServer) {
      try {
        await this.fileService.removeFile(
          getAbsoluteServerPath(section.toObject({ getters: false }).imageURL)
        );
      } catch (err) {
        console.error(
          "Failed removing file from section: ",
          section._id,
          section.imageURL
        );
      }
    }
    return section.remove();
  }
}
