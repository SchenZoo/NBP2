import { JsonController, UseBefore, Get, QueryParams, Post, Body, Put, Param, Delete } from 'routing-controllers'
import { checkRole } from '../middlewares/AuthorizationMiddlewares'
import { RoleNames } from '../../constants/RoleNames'
import { passportJwtMiddleware } from '../middlewares/PassportJwtMiddleware'
import { PaginationSearch } from '../misc/QueryPagination'
import { UserModel } from '../database/models/User'
import { UserValidator } from '../validators/UserValidator'
import { hashPassowrd } from '../misc/Hash'
import { FileService } from '../services/FileService'
import { ModelImagePath } from '../../constants/ModelImagePath'
import { ObjectFromParamNotFound } from '../errors/ObjectFromParamNotFound'
import { DefaultImage } from '../../constants/DefaultImages'

@JsonController('/professor')
@UseBefore(checkRole([RoleNames.ADMIN]))
@UseBefore(passportJwtMiddleware)
export class ProfessorController {
  constructor(private fileService: FileService) {}
  @Get()
  public async get(@QueryParams() query: PaginationSearch) {
    return UserModel.paginate({ username: { $regex: `${query.name ? query.name : ''}` }, roles: 'Professor' }, { limit: query.take, offset: query.skip })
  }

  @Post()
  public async create(@Body({ validate: { whitelist: true } }) professor: UserValidator) {
    professor.roles = [RoleNames.PROFESSOR]
    professor.password = hashPassowrd(professor.password)
    if (professor.imageBase64) {
      professor.imageUrl = await this.fileService.addBase64Image(professor.imageBase64, ModelImagePath.USER_PROFILE)
    }

    return await new UserModel(professor).save()
  }

  @Put('/:id')
  public async update(@Body({ validate: { whitelist: true, skipMissingProperties: true } }) newProfa: UserValidator, @Param('id') id: string) {
    if (newProfa.password) {
      newProfa.password = hashPassowrd(newProfa.password)
    }
    if (newProfa.imageBase64) {
      const professor = await UserModel.findById(id)
      if (!professor) {
        throw new ObjectFromParamNotFound('User', id)
      }
      if (!professor.imageUrl.includes(DefaultImage.USER_PROFILE)) {
        await this.fileService.removeFile(this.fileService.getAbsolutePath(this.fileService.IMAGE_PUBLIC_PATH + professor.imageUrl))
      }
      newProfa.imageUrl = await this.fileService.addBase64Image(newProfa.imageBase64, ModelImagePath.USER_PROFILE)
    }
    return UserModel.updateOne({ id }, newProfa)
  }

  @Delete('/:id')
  public async delete(@Param('id') id: string) {
    const professor = await UserModel.findById(id)
    if (!professor) {
      throw new ObjectFromParamNotFound('User', id)
    }
    if (!professor.imageUrl.includes(DefaultImage.USER_PROFILE)) {
      this.fileService
        .removeFile(this.fileService.getAbsolutePath(this.fileService.IMAGE_PUBLIC_PATH + professor.toObject({ getters: false }).imageUrl))
        .catch(error => console.error(error))
    }
    return professor.remove()
  }
}
