import { IUser } from '../database/models/User'
import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator'
import { Type } from 'class-transformer'

export class UserValidator {
  @IsString()
  @IsNotEmpty()
  username: string
  @IsString()
  @IsNotEmpty()
  password: string
  @IsOptional()
  @IsEmail()
  email: string
  @IsOptional()
  @IsString()
  imageBase64: string
  @IsOptional()
  @IsString()
  name: string

  imageURL: string
  roles: string[]
}
