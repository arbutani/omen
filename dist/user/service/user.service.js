"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const errormessage_service_1 = require("../../shared/services/errormessage.service");
const sequelize_1 = require("sequelize");
const user_dto_1 = require("../dto/user.dto");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
let UserService = class UserService {
    userRepository;
    sequelize;
    errorMessageService;
    jwtService;
    constructor(userRepository, sequelize, errorMessageService, jwtService) {
        this.userRepository = userRepository;
        this.sequelize = sequelize;
        this.errorMessageService = errorMessageService;
        this.jwtService = jwtService;
    }
    async createUser(requestDto) {
        const transaction = await this.sequelize.transaction({
            isolationLevel: sequelize_1.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
        });
        let status = false;
        try {
            const existingUser = await this.userRepository.findOne({
                where: {
                    [sequelize_1.Op.or]: [{ email: requestDto.email }, { mobile: requestDto.mobile }],
                },
                transaction: transaction,
            });
            if (existingUser) {
                if (existingUser.email === requestDto.email) {
                    throw this.errorMessageService.GeneralErrorCore('User with this email already exists', 409);
                }
                else {
                    throw this.errorMessageService.GeneralErrorCore('User with this mobile number already exists', 409);
                }
            }
            const hashedPassword = await bcrypt.hash(requestDto.password, 10);
            const user = await this.userRepository.create({
                name: requestDto.name,
                mobile: requestDto.mobile,
                email: requestDto.email,
                password: hashedPassword,
            }, {
                transaction,
            });
            if (!user) {
                throw this.errorMessageService.GeneralErrorCore('Unable to create user', 500);
            }
            await transaction.commit();
            status = true;
            return new user_dto_1.UserDto(user);
        }
        catch (error) {
            if (status == false) {
                await transaction.rollback().catch(() => { });
            }
            throw this.errorMessageService.CatchHandler(error);
        }
    }
    async login(email, password) {
        const transaction = await this.sequelize.transaction({
            isolationLevel: sequelize_1.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
        });
        let status = false;
        try {
            const user = await this.userRepository.findOne({
                where: { email: email },
                transaction: transaction,
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            if (!user.password) {
                throw new common_1.UnauthorizedException('Account not properly configured');
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            const payload = {
                sub: user.id,
                email: user.email,
                name: user.name,
                mobile: user.mobile,
            };
            const token = await this.jwtService.signAsync(payload, {
                secret: process.env.JWT_SECRET || 'MY_SECRET_KEY',
                expiresIn: process.env.JWT_EXPIRES_IN || '3h',
            });
            await transaction.commit();
            status = true;
            return {
                access_token: token,
                user: new user_dto_1.UserDto(user),
            };
        }
        catch (error) {
            if (status == false) {
                await transaction.rollback().catch(() => { });
            }
            throw this.errorMessageService.CatchHandler(error);
        }
    }
    async updateUser(id, requestDto) {
        const transaction = await this.sequelize.transaction({
            isolationLevel: sequelize_1.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
        });
        let status = false;
        try {
            const oldUser = await this.userRepository.findByPk(id, {
                transaction,
            });
            if (!oldUser) {
                throw this.errorMessageService.GeneralErrorCore('User not found', 404);
            }
            if (requestDto.email && requestDto.email !== oldUser.email) {
                const existingUser = await this.userRepository.findOne({
                    where: {
                        email: requestDto.email,
                        id: { [sequelize_1.Op.ne]: id },
                    },
                    transaction,
                });
                if (existingUser) {
                    throw this.errorMessageService.GeneralErrorCore('User with this email already exists', 409);
                }
            }
            if (requestDto.mobile && requestDto.mobile !== oldUser.mobile) {
                const existingUser = await this.userRepository.findOne({
                    where: {
                        mobile: requestDto.mobile,
                        id: { [sequelize_1.Op.ne]: id },
                    },
                    transaction,
                });
                if (existingUser) {
                    throw this.errorMessageService.GeneralErrorCore('User with this mobile number already exists', 409);
                }
            }
            const updateFields = {
                name: requestDto.name,
                mobile: requestDto.mobile,
                email: requestDto.email,
            };
            if (requestDto.password && requestDto.password.trim() !== '') {
                updateFields.password = await bcrypt.hash(requestDto.password, 10);
            }
            const [updateCount] = await this.userRepository.update(updateFields, {
                where: { id },
                transaction,
            });
            if (updateCount === 0) {
                throw this.errorMessageService.GeneralErrorCore('Failed to update user', 500);
            }
            await transaction.commit();
            status = true;
            const updatedUser = await this.userRepository.findByPk(id);
            if (!updatedUser) {
                throw this.errorMessageService.GeneralErrorCore('Failed to fetch updated user', 500);
            }
            return new user_dto_1.UserDto(updatedUser);
        }
        catch (error) {
            if (status === false) {
                await transaction.rollback().catch(() => { });
            }
            throw this.errorMessageService.CatchHandler(error);
        }
    }
    async getUser(id) {
        try {
            const user = await this.userRepository.findByPk(id);
            if (!user) {
                throw this.errorMessageService.GeneralErrorCore('User not found', 404);
            }
            return new user_dto_1.UserDto(user);
        }
        catch (error) {
            throw this.errorMessageService.CatchHandler(error);
        }
    }
    async getUserByEmail(email) {
        try {
            if (!email || email.trim() === '') {
                throw this.errorMessageService.GeneralErrorCore('Email is required', 400);
            }
            const user = await this.userRepository.findOne({
                where: { email: email.trim().toLowerCase() },
            });
            if (!user) {
                throw this.errorMessageService.GeneralErrorCore('User not found with this email', 404);
            }
            return new user_dto_1.UserDto(user);
        }
        catch (error) {
            throw this.errorMessageService.CatchHandler(error);
        }
    }
    async getUsersByName(name) {
        try {
            if (!name || name.trim() === '') {
                throw this.errorMessageService.GeneralErrorCore('Name is required for search', 400);
            }
            const users = await this.userRepository.findAll({
                where: {
                    name: {
                        [sequelize_1.Op.iLike]: `%${name.trim()}%`,
                    },
                },
            });
            if (!users || users.length === 0) {
                throw this.errorMessageService.GeneralErrorCore('No users found with this name', 404);
            }
            return users.map((user) => new user_dto_1.UserDto(user));
        }
        catch (error) {
            throw this.errorMessageService.CatchHandler(error);
        }
    }
    async getUsersByEmailOrName(email, name) {
        try {
            const whereCondition = {};
            if (email && email.trim() !== '') {
                whereCondition.email = email.trim().toLowerCase();
            }
            if (name && name.trim() !== '') {
                whereCondition.name = {
                    [sequelize_1.Op.iLike]: `%${name.trim()}%`,
                };
            }
            if (Object.keys(whereCondition).length === 0) {
                throw this.errorMessageService.GeneralErrorCore('Please provide either email or name for search', 400);
            }
            const users = await this.userRepository.findAll({
                where: whereCondition,
            });
            if (!users || users.length === 0) {
                throw this.errorMessageService.GeneralErrorCore('No users found with the given criteria', 404);
            }
            return users.map((user) => new user_dto_1.UserDto(user));
        }
        catch (error) {
            throw this.errorMessageService.CatchHandler(error);
        }
    }
    async getAllUsers(requestDto) {
        try {
            const users = await this.userRepository.findAll({
                order: [['createdAt', 'DESC']],
            });
            if (!users || users.length === 0) {
                throw this.errorMessageService.GeneralErrorCore('No users found', 404);
            }
            return users.map((user) => new user_dto_1.UserDto(user));
        }
        catch (error) {
            throw this.errorMessageService.CatchHandler(error);
        }
    }
    async deleteUser(id) {
        const transaction = await this.sequelize.transaction({
            isolationLevel: sequelize_1.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
        });
        let status = false;
        try {
            const deletedRows = await this.userRepository.destroy({
                where: { id: id },
                transaction: transaction,
            });
            if (deletedRows === 0) {
                throw this.errorMessageService.GeneralErrorCore('User not found', 404);
            }
            await transaction.commit();
            status = true;
            return { message: 'User deleted successfully' };
        }
        catch (error) {
            if (status == false) {
                await transaction.rollback().catch(() => { });
            }
            throw this.errorMessageService.CatchHandler(error);
        }
    }
    async searchUsers(criteria) {
        try {
            const whereCondition = {};
            if (criteria.email && criteria.email.trim() !== '') {
                whereCondition.email = criteria.email.trim().toLowerCase();
            }
            if (criteria.name && criteria.name.trim() !== '') {
                whereCondition.name = {
                    [sequelize_1.Op.iLike]: `%${criteria.name.trim()}%`,
                };
            }
            if (criteria.mobile && criteria.mobile.trim() !== '') {
                whereCondition.mobile = criteria.mobile.trim();
            }
            if (Object.keys(whereCondition).length === 0) {
                throw this.errorMessageService.GeneralErrorCore('Please provide at least one search criteria (email, name, or mobile)', 400);
            }
            const users = await this.userRepository.findAll({
                where: whereCondition,
                order: [['createdAt', 'DESC']],
            });
            if (!users || users.length === 0) {
                throw this.errorMessageService.GeneralErrorCore('No users found with the given criteria', 404);
            }
            return users.map((user) => new user_dto_1.UserDto(user));
        }
        catch (error) {
            throw this.errorMessageService.CatchHandler(error);
        }
    }
    async getUsersWithPagination(page = 1, limit = 10, search) {
        try {
            const offset = (page - 1) * limit;
            const whereCondition = {};
            if (search && search.trim() !== '') {
                whereCondition[sequelize_1.Op.or] = [
                    { name: { [sequelize_1.Op.iLike]: `%${search.trim()}%` } },
                    { email: { [sequelize_1.Op.iLike]: `%${search.trim()}%` } },
                    { mobile: { [sequelize_1.Op.iLike]: `%${search.trim()}%` } },
                ];
            }
            const { count, rows } = await this.userRepository.findAndCountAll({
                where: whereCondition,
                limit,
                offset,
                order: [['createdAt', 'DESC']],
            });
            return {
                users: rows.map((user) => new user_dto_1.UserDto(user)),
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit),
                },
            };
        }
        catch (error) {
            throw this.errorMessageService.CatchHandler(error);
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('USER_REPOSITORY')),
    __param(1, (0, common_1.Inject)('SEQUELIZE')),
    __metadata("design:paramtypes", [Object, sequelize_1.Sequelize,
        errormessage_service_1.ErrorMessageService,
        jwt_1.JwtService])
], UserService);
//# sourceMappingURL=user.service.js.map