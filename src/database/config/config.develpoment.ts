/* eslint-disable prettier/prettier */

import * as dotenv from 'dotenv';
import type { Dialect } from 'sequelize';

dotenv.config({ path: '.env' });
export const config_dev = {
  database: {
    dialect: 'postgres' as Dialect,
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'root123',
    database: process.env.DB_DATABASE ?? 'omen',
  },
};
