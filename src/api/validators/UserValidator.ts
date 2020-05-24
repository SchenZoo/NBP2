import { IsString, IsNotEmpty, IsOptional, IsEmail } from "class-validator";

export class UserValidator {
  @IsString()
  @IsNotEmpty()
  username: string;
  @IsString()
  @IsOptional()
  password: string;
  @IsOptional()
  @IsEmail()
  email: string;
  @IsOptional()
  @IsString()
  imageBase64: string;
  @IsOptional()
  @IsString()
  name: string;

  imageURL: string;
  roles: string[];
}
