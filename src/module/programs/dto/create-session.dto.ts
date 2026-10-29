import {
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
export class CreateSessionDto {
  @IsDateString()
  startsAt: string;
  @IsDateString()
  endsAt: string;
  @IsOptional()
  @IsString()
  @MaxLength(250)
  location?: string;
  @IsOptional()
  @IsUrl({ require_protocol: true })
  meetingUrl?: string;
}
