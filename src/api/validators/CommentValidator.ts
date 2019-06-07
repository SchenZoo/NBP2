import { IsOptional, IsString, IsBase64, ValidateIf, IsNotEmpty } from 'class-validator'

export class CommentValidator {
  @ValidateIf((object, value) => {
    return object.imageBase64
  })
  @IsNotEmpty()
  @IsString()
  text: string
  @ValidateIf((object, value) => {
    return object.text
  })
  @IsNotEmpty()
  @IsBase64()
  imageBase64: string

  imageURL: string
}
