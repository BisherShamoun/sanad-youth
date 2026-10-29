import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

// const normalizeEmail = ({ value }: { value: unknown }) =>
//   typeof value === 'string' ? value.trim().toLowerCase() : value;

export class RegisterDto {
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
