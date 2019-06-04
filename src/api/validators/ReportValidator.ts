import { IReportTicket } from '../database/models/ReportTicket'
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { isString } from 'util';

export class ReportValidator {
  @IsString()
  @IsNotEmpty()
  text: string
  @IsNotEmpty()
  @IsEmail()
  contactEmail: string
  @IsNotEmpty()
  @IsString()
  contactName: string
}
