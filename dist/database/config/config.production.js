"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config_prod = void 0;
exports.config_prod = {
    database: {
        dialect: 'postgres',
        url: process.env.DATABASE_URL,
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
//# sourceMappingURL=config.production.js.map