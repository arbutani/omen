/* eslint-disable prettier/prettier */
import * as dotenv from 'dotenv';
import type { Dialect } from 'sequelize';

dotenv.config({ path: '.env' });

export const config_prod = {
  database: {
    dialect: 'postgres' as Dialect,
    // Yahan hum poori URL use karenge jo Render se aa rahi hai
    url: process.env.DATABASE_URL,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Cloud DB (Supabase) ke liye ye zaroori hai
      },
    },
  },
};
