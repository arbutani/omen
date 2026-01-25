import { ErrorMessageService } from '../../common/services/errormessage.service';
import { UserRequestDto } from '../dto/userRequest.dto';
import { UserOauthRequestDto } from '../dto/userOauthRequest.dto';
import { UserService } from '../service/user.service';
import { UserPutRequestDto } from '../dto/userPutRequest.dto';
export declare class UserController {
    private readonly userService;
    private readonly errorMessageService;
    constructor(userService: UserService, errorMessageService: ErrorMessageService);
    createUser(requestDto: UserRequestDto): Promise<any>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        status: boolean;
        message: string;
        data: any;
        error?: string;
    }>;
    oauthLogin(body: UserOauthRequestDto): Promise<{
        status: boolean;
        message: string;
        data: any;
        error?: string;
    }>;
    googleLogin(body: {
        token: string;
    }): Promise<import("@nestjs/common").HttpException | {
        status: boolean;
        message: string;
        data: any;
        error?: string;
    }>;
    verifyGoogleToken(body: {
        token: string;
    }): Promise<import("@nestjs/common").HttpException | {
        status: boolean;
        message: string;
        data: any;
        error?: string;
    }>;
    updateUser(id: string, requestDto: UserPutRequestDto): Promise<any>;
    getUser(id: string): Promise<any>;
    getUserByEmail(email: string): Promise<any>;
    getUsersByName(name: string): Promise<any>;
    getUsersByEmailOrName(email?: string, name?: string): Promise<any>;
    getAllUsers(page?: number, limit?: number, search?: string): Promise<any>;
    deleteUser(id: string): Promise<any>;
    searchUsers(email?: string, name?: string, mobile?: string): Promise<any>;
}
