import { IsOptional, IsArray, IsString, IsEnum, IsInt, ValidateIf, IsNotEmpty } from 'class-validator'
import { Type } from 'class-transformer'
import { MessageDataModels } from '../database/models/Message'

export class ChatMessageValidator {
  @IsOptional()
  @Type(() => String)
  @IsArray()
  filesBase64: string[]

  @IsOptional()
  @IsString()
  text: string

  @ValidateIf((object, value) => {
    return object.data
  })
  @IsNotEmpty()
  @IsEnum(MessageDataModels)
  public onModel: string
  @ValidateIf((object, value) => {
    return object.onModel
  })
  @IsNotEmpty()
  @IsString()
  public data: string

  files: string[]
  sender: number
  session: number
}
