import { ErrorMessageService } from 'src/shared/services/errormessage.service';
import { SuccessResponseDto } from 'src/shared/dto/successResponse.dto';
import { UserRequestDto } from '../dto/userRequest.dto';
import { UserService } from '../service/user.service';
import { UserPutRequestDto } from '../dto/userPutRequest.dto';
export declare class UserController {
    private readonly userService;
    private readonly errorMessageService;
    constructor(userService: UserService, errorMessageService: ErrorMessageService);
    createUser(requestDto: UserRequestDto): Promise<SuccessResponseDto>;
    login(body: {
        email: string;
        password: string;
    }): Promise<SuccessResponseDto>;
    updateUser(id: string, requestDto: UserPutRequestDto): Promise<SuccessResponseDto>;
    getUser(id: string): Promise<SuccessResponseDto>;
    getUserByEmail(email: string): Promise<SuccessResponseDto>;
    getUsersByName(name: string): Promise<SuccessResponseDto>;
    getUsersByEmailOrName(email?: string, name?: string): Promise<SuccessResponseDto>;
    getAllUsers(page?: number, limit?: number, search?: string): Promise<any>;
    deleteUser(id: string): Promise<SuccessResponseDto>;
    searchUsers(email?: string, name?: string, mobile?: string): Promise<SuccessResponseDto>;
}
