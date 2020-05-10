import { IsString, ValidateIf, IsNotEmpty } from "class-validator";

export class CommentValidator {
  @ValidateIf((object, value) => {
    return !object.imageBase64;
  })
  @IsNotEmpty()
  @IsString()
  text: string;
  @ValidateIf((object, value) => {

    return !object.text;
  })
  @IsNotEmpty()
  @IsString()
  imageBase64: string;

  imageURL: string;
}
