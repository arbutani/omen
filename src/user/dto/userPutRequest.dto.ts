/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UserPutRequestDto {
  @IsNotEmpty({ message: 'User name is required' })
  @IsString({ message: 'User name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'User mobile is required' })
  @IsString({ message: 'User mobile must be a string' })
  mobile: string;

  @IsNotEmpty({ message: 'Email address is required' })
  @IsString({ message: 'Email address must be a string' })
  email: string;

  @IsOptional()
  @ValidateIf((o) => o.password !== undefined)
  @IsString({ message: 'Password must be a string' })
  password?: string;
}
