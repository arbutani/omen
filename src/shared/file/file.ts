/* eslint-disable prettier/prettier */
import * as express from 'express';
import { join } from 'path';

export function Files(app: any) {

  app.use(
    '/upload/photo',
     express.static(join(process.cwd(), 'upload', 'photo')),
  );

}