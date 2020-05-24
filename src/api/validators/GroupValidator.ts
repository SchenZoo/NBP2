import { IsString, IsNotEmpty, IsOptional, IsArray } from "class-validator";

export class GroupObjectValidator {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsOptional()
  @IsArray()
  participantIds: string[];
}
