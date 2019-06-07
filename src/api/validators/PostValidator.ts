import { IsOptional, IsString, IsNotEmpty } from 'class-validator'

export class PostValidator {
  @IsNotEmpty()
  @IsString()
  title: string
  @IsNotEmpty()
  @IsString()
  description: string
}
