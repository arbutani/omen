"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const errormessage_service_1 = require("../../common/services/errormessage.service");
const userRequest_dto_1 = require("../dto/userRequest.dto");
const user_service_1 = require("../service/user.service");
const jwt_auth_guard_1 = require("../../JwtAuthGuard/jwt_auth.guard");
const public_decorator_1 = require("../../JwtAuthGuard/public.decorator");
const userPutRequest_dto_1 = require("../dto/userPutRequest.dto");
let UserController = class UserController {
    userService;
    errorMessageService;
    constructor(userService, errorMessageService) {
        this.userService = userService;
        this.errorMessageService = errorMessageService;
    }
    async createUser(requestDto) {
        try {
            const user = await this.userService.createUser(requestDto);
            return this.errorMessageService.success(user, true, 'User created successfully', {});
        }
        catch (error) {
            throw this.errorMessageService.error(error);
        }
    }
    async login(body) {
        try {
            const result = await this.userService.login(body.email, body.password);
            return this.errorMessageService.success(result, true, 'Login successful', {});
        }
        catch (error) {
            throw this.errorMessageService.error(error);
        }
    }
    async updateUser(id, requestDto) {
        try {
            const user = await this.userService.updateUser(id, requestDto);
            return this.errorMessageService.success(user, true, 'User updated successfully', {});
        }
        catch (error) {
            throw this.errorMessageService.error(error);
        }
    }
    async getUser(id) {
        try {
            const user = await this.userService.getUser(id);
            return this.errorMessageService.success(user, true, 'User retrieved successfully', {});
        }
        catch (error) {
            throw this.errorMessageService.error(error);
        }
    }
    async getUserByEmail(email) {
        try {
            const user = await this.userService.getUserByEmail(email);
            return this.errorMessageService.success(user, true, 'User retrieved successfully', {});
        }
        catch (error) {
            throw this.errorMessageService.error(error);
        }
    }
    async getUsersByName(name) {
        try {
            const users = await this.userService.getUsersByName(name);
            return this.errorMessageService.success(users, true, 'Users retrieved successfully', {});
        }
        catch (error) {
            throw this.errorMessageService.error(error);
        }
    }
    async getUsersByEmailOrName(email, name) {
        try {
            const users = await this.userService.getUsersByEmailOrName(email, name);
            return this.errorMessageService.success(users, true, 'Users retrieved successfully', {});
        }
        catch (error) {
            throw this.errorMessageService.error(error);
        }
    }
    async getAllUsers(page, limit, search) {
        try {
            if (page || limit || search) {
                const pageNum = page ? Number(page) : 1;
                const limitNum = limit ? Number(limit) : 10;
                return await this.userService.getUsersWithPagination(pageNum, limitNum, search);
            }
            else {
                const users = await this.userService.getAllUsers();
                return this.errorMessageService.success(users, true, 'Users retrieved successfully', {});
            }
        }
        catch (error) {
            throw this.errorMessageService.error(error);
        }
    }
    async deleteUser(id) {
        try {
            const result = await this.userService.deleteUser(id);
            return this.errorMessageService.success(result, true, 'User deleted successfully', {});
        }
        catch (error) {
            throw this.errorMessageService.error(error);
        }
    }
    async searchUsers(email, name, mobile) {
        try {
            const users = await this.userService.searchUsers({ email, name, mobile });
            return this.errorMessageService.success(users, true, 'Users retrieved successfully', {});
        }
        catch (error) {
            throw this.errorMessageService.error(error);
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [userRequest_dto_1.UserRequestDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUser", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, userPutRequest_dto_1.UserPutRequestDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('email/:email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserByEmail", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('search/by-name/:name'),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsersByName", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('search/by-credentials'),
    __param(0, (0, common_1.Query)('email')),
    __param(1, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsersByEmailOrName", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('search/advanced'),
    __param(0, (0, common_1.Query)('email')),
    __param(1, (0, common_1.Query)('name')),
    __param(2, (0, common_1.Query)('mobile')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "searchUsers", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        errormessage_service_1.ErrorMessageService])
], UserController);
//# sourceMappingURL=user.controller.js.map