/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { databaseProviders } from '../providers/database.providers';
import { ConfigModule } from '@nestjs/config';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: false,
    }),
  ],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
