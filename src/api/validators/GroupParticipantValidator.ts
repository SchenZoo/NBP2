import { GROUP_PARTICIPANT_TYPES } from "./../../constants/models/group/GroupParticipantTypes";
import { IsString, IsNotEmpty, Matches } from "class-validator";

export class GroupParticipantObjectValidator {
  @IsNotEmpty()
  @IsString()
  participantId: string;

  @IsNotEmpty()
  @IsString()
  @Matches(new RegExp(Object.values(GROUP_PARTICIPANT_TYPES).join("|")))
  type: string;
}
