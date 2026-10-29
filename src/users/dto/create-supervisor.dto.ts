import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
export class CreateSupervisorDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  firstName: string;
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_.-]+$/)
  username: string;
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
