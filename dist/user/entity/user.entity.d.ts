import { Model } from 'sequelize-typescript';
export declare class User extends Model<User> {
    id: string;
    name: string;
    mobile: string;
    email: string;
    password: string;
    provider: string;
    providerId: string;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
