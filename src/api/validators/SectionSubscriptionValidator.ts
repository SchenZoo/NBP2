import { IsString, IsNotEmpty } from "class-validator";

export class SectionSubscriptionValidation {
  @IsNotEmpty()
  @IsString()
  sectionId: string;
}
