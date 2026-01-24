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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const errormessage_service_1 = require("../../common/services/errormessage.service");
const sequelize_1 = require("sequelize");
const user_dto_1 = require("../dto/user.dto");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const axios_1 = __importDefault(require("axios"));
let UserService = class UserService {
    userRepository;
    sequelize;
    errorMessageService;
    jwtService;
    GOOGLE_CLIENT_ID = '963430831548-ms7rv6n43su0p2qfd2of5bdt2ghngb7a.apps.googleusercontent.com';
    constructor(userRepository, sequelize, errorMessageService, jwtService) {
        this.userRepository = userRepository;
        this.sequelize = sequelize;
        this.errorMessageService = errorMessageService;
        this.jwtService = jwtService;
    }
    async verifyGoogleToken(token) {
        try {
            const tokenInfoResponse = await axios_1.default.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
            const tokenInfo = tokenInfoResponse.data;
            if (tokenInfo.aud !== this.GOOGLE_CLIENT_ID) {
                throw new common_1.UnauthorizedException('Invalid Google client ID');
            }
            const currentTime = Math.floor(Date.now() / 1000);
            if (tokenInfo.exp && tokenInfo.exp < currentTime) {
                throw new common_1.UnauthorizedException('Google token has expired');
            }
            return tokenInfo;
        }
        catch (error) {
            console.error('Google token verification failed:', error.response?.data || error.message);
            try {
                const userInfoResponse = await axios_1.default.get('https://www.googleapis.com/oauth2/v1/userinfo', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                return {
                    email: userInfoResponse.data.email,
                    name: userInfoResponse.data.name,
                    sub: userInfoResponse.data.id,
                    verified: true,
                };
            }
            catch (secondError) {
                console.error('Alternative verification also failed:', secondError.message);
                throw new common_1.UnauthorizedException('Invalid Google token. Please try again.');
            }
        }
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
    async oauthLogin(oauthDto) {
        const transaction = await this.sequelize.transaction({
            isolationLevel: sequelize_1.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
        });
        let status = false;
        try {
            console.log('OAuth Login Request:', {
                provider: oauthDto.provider,
                email: oauthDto.email,
                hasToken: !!oauthDto.token,
            });
            if (oauthDto.provider === 'google' && oauthDto.token) {
                console.log('Verifying Google token...');
                try {
                    const verifiedData = await this.verifyGoogleToken(oauthDto.token);
                    console.log('Google Token Verified:', {
                        email: verifiedData.email,
                        googleId: verifiedData.sub,
                        name: verifiedData.name,
                    });
                    oauthDto.email = verifiedData.email;
                    oauthDto.providerId = verifiedData.sub;
                    if (verifiedData.name && !oauthDto.name) {
                        oauthDto.name = verifiedData.name;
                    }
                }
                catch (googleError) {
                    console.error('Google token verification failed:', googleError.message);
                    throw new common_1.UnauthorizedException('Invalid Google token: ' + googleError.message);
                }
            }
            const provider = oauthDto.provider;
            const providerId = oauthDto.providerId;
            const email = oauthDto.email ? oauthDto.email.trim().toLowerCase() : null;
            const name = oauthDto.name || 'Google User';
            console.log('Processing OAuth for:', {
                provider,
                providerId,
                email,
                name,
            });
            let user = null;
            if (provider && providerId) {
                user = await this.userRepository.findOne({
                    where: { provider, providerId },
                    transaction,
                });
                console.log('User found by provider:', user ? 'Yes' : 'No');
            }
            if (!user && email) {
                user = await this.userRepository.findOne({
                    where: { email },
                    transaction,
                });
                console.log('User found by email:', user ? 'Yes' : 'No');
            }
            if (user) {
                console.log('Existing user found:', user.email);
                const needsUpdate = {};
                if (!user.provider && provider)
                    needsUpdate.provider = provider;
                if (!user.providerId && providerId)
                    needsUpdate.providerId = providerId;
                if (!user.name && name)
                    needsUpdate.name = name;
                if (Object.keys(needsUpdate).length > 0) {
                    console.log('Updating user with:', needsUpdate);
                    await this.userRepository.update(needsUpdate, {
                        where: { id: user.id },
                        transaction,
                    });
                    user = await this.userRepository.findByPk(user.id, { transaction });
                }
            }
            else {
                console.log('Creating new OAuth user with email:', email);
                const newUser = await this.userRepository.create({
                    name: name,
                    mobile: oauthDto.mobile || '',
                    email: email || '',
                    password: null,
                    provider: provider || null,
                    providerId: providerId || null,
                    isEmailVerified: provider === 'google' ? true : false,
                }, { transaction });
                if (!newUser) {
                    throw this.errorMessageService.GeneralErrorCore('Unable to create user from OAuth data', 500);
                }
                user = newUser;
                console.log('New user created:', user.id);
            }
            const payload = {
                sub: user.id,
                email: user.email,
                name: user.name,
                mobile: user.mobile,
                provider: user.provider,
            };
            const token = await this.jwtService.signAsync(payload, {
                secret: process.env.JWT_SECRET || 'MY_SECRET_KEY',
                expiresIn: process.env.JWT_EXPIRES_IN || '7d',
            });
            await transaction.commit();
            status = true;
            console.log('OAuth login successful for user:', user.email);
            return {
                access_token: token,
                user: new user_dto_1.UserDto(user),
                message: 'Login successful',
            };
        }
        catch (error) {
            console.error('OAuth login error:', error.message);
            if (status == false) {
                await transaction.rollback().catch(() => { });
            }
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
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