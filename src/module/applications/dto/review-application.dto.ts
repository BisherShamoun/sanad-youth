import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
export class ReviewApplicationDto {
  @IsIn(['ACCEPTED', 'REJECTED'])
  status: 'ACCEPTED' | 'REJECTED';
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reviewNote?: string;
}
