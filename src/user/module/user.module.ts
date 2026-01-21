/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';
import { ErrorMessageService } from '../../common/services/errormessage.service';
import { JwtAuthGuard } from 'src/JwtAuthGuard/jwt_auth.guard';

import { UserProvider } from '../provider/user.provider';
import { UserService } from '../service/user.service';
import { UserController } from '../controller/user.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'MY_SECRET_KEY',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [UserController],
  providers: [...UserProvider, UserService, ErrorMessageService, JwtAuthGuard],
  exports: [UserService],
})
export class UserModule { }
