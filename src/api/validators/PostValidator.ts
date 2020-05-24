import { IsOptional, IsString, IsNotEmpty, IsEnum, ValidateNested, IsDate } from 'class-validator';
import { PostTypes } from '../database/models/Post';
import { Type } from 'class-transformer';

export class PostObjectValidator {
  @IsNotEmpty()
  @IsString()
  title: string;
  @IsNotEmpty()
  @IsString()
  text: string;
  @IsOptional()
  @IsString()
  startsAt: Date;
  @IsOptional()
  @IsString()
  endsAt: Date;

  section: string;
  user: string;
}

export class PostValidator {
  @IsNotEmpty()
  @IsEnum(PostTypes)
  type: PostTypes;
  @Type(() => PostObjectValidator)
  @ValidateNested({})
  post: PostObjectValidator;
}
