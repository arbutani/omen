import { Dialect } from 'sequelize';

export const config_prod = {
  database: {
    dialect: 'postgres' as Dialect,
    // Agar DATABASE_URL hai toh wahi use karega (Render ke liye)
    url: process.env.DATABASE_URL,
    // Agar URL nahi hai toh niche wale settings kaam aayenge
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
