/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserOauthRequestDto {
  @IsNotEmpty({ message: 'Provider is required' })
  @IsString()
  provider: string;

  @IsNotEmpty({ message: 'Provider id is required' })
  @IsString()
  providerId: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  mobile?: string;
}
