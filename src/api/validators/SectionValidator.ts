import { IsString, IsNotEmpty } from 'class-validator'
import { IUser } from '../database/models/User'

export class SectionValidation {
  @IsString()
  @IsNotEmpty()
  name: string

  creator: IUser
}
