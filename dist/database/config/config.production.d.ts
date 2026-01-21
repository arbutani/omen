import { Dialect } from 'sequelize';
export declare const config_prod: {
    database: {
        dialect: Dialect;
        url: string | undefined;
        host: string | undefined;
        port: number;
        username: string | undefined;
        password: string | undefined;
        database: string | undefined;
        dialectOptions: {
            ssl: {
                require: boolean;
                rejectUnauthorized: boolean;
            };
        };
    };
};
