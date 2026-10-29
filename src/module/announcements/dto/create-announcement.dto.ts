import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
export class CreateAnnouncementDto {
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title: string;
  @IsString()
  @MinLength(5)
  body: string;
  @IsIn(['GENERAL', 'PROGRAM'])
  scope: 'GENERAL' | 'PROGRAM';
  @IsOptional()
  @IsInt()
  programId?: number;
}
