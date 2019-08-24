import { IsString, IsNotEmpty, IsBase64 } from 'class-validator'
import { IUser } from '../database/models/User'

export class SectionValidation {
  @IsNotEmpty()
  @IsString()
  name: string
  @IsString()
  @IsNotEmpty()
  imageBase64: string

  imageURL: string

  user: IUser
}
