import { Model } from 'sequelize-typescript';
export declare class User extends Model<User> {
    id: string;
    name: string;
    mobile: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}
