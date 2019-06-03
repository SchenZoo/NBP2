import { JsonController, UseBefore, Get, CurrentUser, Post, Body, Put, Param, Delete } from 'routing-controllers'
import { passportJwtMiddleware } from '../middlewares/PassportJwtMiddleware'
import { checkRole } from '../middlewares/AuthorizationMiddlewares'
import { RoleNames } from '../../constants/RoleNames'
import { SectionModel } from '../database/models/Section'
import { SectionValidation } from '../validators/SectionValidator'
import { IUser } from '../database/models/User'

@JsonController('/section')
export class SectionController {
  @Get()
  public async get() {
    return SectionModel.find().sort({ createdAt: -1 })
  }

  @Post()
  @UseBefore(passportJwtMiddleware, checkRole([RoleNames.ADMIN]))
  public async create(@Body() section: SectionValidation, @CurrentUser() user: IUser) {
    section.creator = user
    return new SectionModel(section).save()
  }

  @Put('/:id')
  @UseBefore(checkRole([RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async update(@Body() section: SectionValidation, @Param('id') id: string) {
    return SectionModel.updateOne({ id }, section)
  }

  @Delete('/:id')
  @UseBefore(checkRole([RoleNames.ADMIN]))
  @UseBefore(passportJwtMiddleware)
  public async delete(@Param('id') id: string) {
    return SectionModel.deleteOne({ id })
  }
}
