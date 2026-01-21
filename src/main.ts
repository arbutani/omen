/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpException, ValidationPipe } from '@nestjs/common';
<<<<<<< HEAD

=======
>>>>>>> 3ad2a934053675a36337477b958a0c64b7c726a0

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        return new HttpException(
          {
            status: false,
            message: errors.map((error) => ({
              field: error.property,
              message: error.constraints
                ? error.constraints[Object.keys(error.constraints)[0]]
                : '',
            })),
          },
          422,
        );
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
