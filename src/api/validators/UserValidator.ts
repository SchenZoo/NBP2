import { IUser } from '../database/models/User'
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray, IsBase64 } from 'class-validator'
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
  @IsBase64()
  imageBase64: string

  imageURL: string
  roles: string[]
}
