/* eslint-disable prettier/prettier */
import { Sequelize } from 'sequelize-typescript';
import { TableList } from '../tablesList';
import { config_dev } from '../config/config.develpoment';
import { config_prod } from '../config/config.production';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env', quiet: true });

// Render par default environment "production" hota hai
const environment = process.env.NODE_ENV || 'development';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      let sequelize: Sequelize;

      if (process.env.DATABASE_URL) {
        // Agar DATABASE_URL (Render/Supabase) maujood hai
        sequelize = new Sequelize(process.env.DATABASE_URL, {
          dialect: 'postgres',
          protocol: 'postgres',
          dialectOptions: config_prod.database.dialectOptions, // SSL settings yahan se aayengi
          logging: false,
        });
      } else {
        // Local machine ke liye
        sequelize = new Sequelize(config_dev.database);
      }

      sequelize.addModels([...TableList]);
      await sequelize.authenticate(); // Connection check karne ke liye
      return sequelize;
    },
  },
];
