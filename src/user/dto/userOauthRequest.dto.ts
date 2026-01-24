/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserOauthRequestDto {
  @IsOptional({ message: 'Provider is required' })
  @IsString()
  provider: string;

  @IsOptional({ message: 'Provider id is required' })
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

  @IsNotEmpty()
  @IsString()
  token: string;
}
