import { IsString, IsNotEmpty } from "class-validator";

export class GroupObjectValidator {
  @IsNotEmpty()
  @IsString()
  name: string;
}
