import { IUser } from '../database/models/User'
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray } from 'class-validator'
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
  @Type(() => String)
  @IsArray()
  roles: string[]
}
