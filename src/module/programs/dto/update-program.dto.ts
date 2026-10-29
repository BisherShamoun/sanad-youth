import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';
export class UpdateProgramDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title?: string;
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
