import { IsString, IsNotEmpty, IsBase64 } from 'class-validator'
import { IUser } from '../database/models/User'

export class SectionValidation {
  @IsString()
  @IsNotEmpty()
  name: string
  @IsNotEmpty()
  @IsBase64()
  imageBase64: string

  imageURL: string

  user: IUser
}
