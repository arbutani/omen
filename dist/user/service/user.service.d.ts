import { ErrorMessageService } from '../../common/services/errormessage.service';
import { Sequelize } from 'sequelize';
import { User } from '../entity/user.entity';
import { UserRequestDto } from '../dto/userRequest.dto';
import { UserDto } from '../dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserPutRequestDto } from '../dto/userPutRequest.dto';
export declare class UserService {
    private readonly userRepository;
    private readonly sequelize;
    private readonly errorMessageService;
    private readonly jwtService;
    constructor(userRepository: typeof User, sequelize: Sequelize, errorMessageService: ErrorMessageService, jwtService: JwtService);
    createUser(requestDto: UserRequestDto): Promise<UserDto>;
    login(email: string, password: string): Promise<{
        access_token: string;
        user: UserDto;
    }>;
    updateUser(id: string, requestDto: UserPutRequestDto): Promise<UserDto>;
    getUser(id: string): Promise<UserDto>;
    getUserByEmail(email: string): Promise<UserDto>;
    getUsersByName(name: string): Promise<UserDto[]>;
    getUsersByEmailOrName(email?: string, name?: string): Promise<UserDto[]>;
    getAllUsers(requestDto?: any): Promise<UserDto[]>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    searchUsers(criteria: {
        email?: string;
        name?: string;
        mobile?: string;
    }): Promise<UserDto[]>;
    getUsersWithPagination(page?: number, limit?: number, search?: string): Promise<{
        users: UserDto[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
