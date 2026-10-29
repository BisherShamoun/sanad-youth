import { IsInt, IsString, Min, MinLength, MaxLength } from 'class-validator';
export class CreateProgramDto {
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title: string;
  @IsString()
  @MinLength(10)
  description: string;
  @IsInt()
  @Min(1)
  capacity: number;
}
