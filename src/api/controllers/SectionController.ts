import { JsonController, UseBefore, Get, CurrentUser, Post, Body, Put, Param, Delete } from 'routing-controllers'
import { passportJwtMiddleware } from '../middlewares/PassportJwtMiddleware'
import { checkRole } from '../middlewares/AuthorizationMiddlewares'
import { RoleNames } from '../../constants/RoleNames'
import { SectionModel } from '../database/models/Section'
import { SectionValidation } from '../validators/SectionValidator'
import { IUser } from '../database/models/User'
import { FileService } from '../services/FileService'
import { ModelImagePath } from '../../constants/ModelImagePath'
import { ObjectFromParamNotFound } from '../errors/ObjectFromParamNotFound'

@JsonController('/section')
export class SectionController {
  constructor(private fileService: FileService) {}
  @Get()
  public async get() {
    return SectionModel.find().sort({ createdAt: -1 })
  }

  @Post()
  @UseBefore(passportJwtMiddleware, checkRole([RoleNames.ADMIN]))
  public async create(@Body() section: SectionValidation, @CurrentUser() user: IUser) {
    section.creator = user
    section.imageUrl = await this.fileService.addBase64Image(section.imageBase64, ModelImagePath.SECTION)
    return new SectionModel(section).save()
  }

  @Put('/:id')
  @UseBefore(checkRole([RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async update(
    @Body({ validate: { skipMissingProperties: true, whitelist: true }, required: true }) section: SectionValidation,
    @Param('id') id: string,
  ) {
    if (section.imageUrl) {
      const oldSection = await SectionModel.findById(id)
      if (!oldSection) {
        throw new ObjectFromParamNotFound('Section', id)
      }
      await this.fileService.removeFile(this.fileService.IMAGE_PUBLIC_PATH + oldSection.imageUrl)
      section.imageUrl = await this.fileService.addBase64Image(section.imageUrl, ModelImagePath.SECTION)
    }
    return SectionModel.updateOne({ id }, section)
  }

  @Delete('/:id')
  @UseBefore(checkRole([RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async delete(@Param('id') id: string) {
    const section = await SectionModel.findById(id)
    if (!section) {
      throw new ObjectFromParamNotFound('Section', id)
    }
    await this.fileService.removeFile(this.fileService.getAbsolutePath(this.fileService.IMAGE_PUBLIC_PATH + section.toObject({ getters: false }).imageUrl))
    return SectionModel.deleteOne({ id })
  }
}
