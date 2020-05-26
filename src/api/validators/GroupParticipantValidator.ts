import { IsNotEmpty, IsArray } from "class-validator";

export class GroupParticipantObjectValidator {
  @IsNotEmpty()
  @IsArray()
  participantIds: string[];
}
