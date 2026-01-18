import { Module } from '@nestjs/common';
import { moduleList } from './moduleList';


@Module({
  imports: [...moduleList],
  controllers: [],
  providers: [],
})
export class AppModule {}
