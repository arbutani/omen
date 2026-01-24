/* eslint-disable prettier/prettier */
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorMessageService } from '../../common/services/errormessage.service';
import { Op, Sequelize, Transaction } from 'sequelize';
import { User } from '../entity/user.entity';
import { UserRequestDto } from '../dto/userRequest.dto';
import { UserDto } from '../dto/user.dto';
import { UserOauthRequestDto } from '../dto/userOauthRequest.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserPutRequestDto } from '../dto/userPutRequest.dto';
import axios from 'axios';

@Injectable()
export class UserService {
  // Google Client ID - Expo Web Client
  private readonly GOOGLE_CLIENT_ID =
    '963430831548-ms7rv6n43su0p2qfd2of5bdt2ghngb7a.apps.googleusercontent.com';

  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: typeof User,
    @Inject('SEQUELIZE')
    private readonly sequelize: Sequelize,
    private readonly errorMessageService: ErrorMessageService,
    private readonly jwtService: JwtService,
  ) {}

  // Helper method to verify Google token without library
  async verifyGoogleToken(token: string): Promise<any> {
    try {
      // Method 1: Verify ID token
      const tokenInfoResponse = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
      );

      const tokenInfo = tokenInfoResponse.data;

      // Verify audience (client ID)
      if (tokenInfo.aud !== this.GOOGLE_CLIENT_ID) {
        throw new UnauthorizedException('Invalid Google client ID');
      }

      // Check token expiry
      const currentTime = Math.floor(Date.now() / 1000);
      if (tokenInfo.exp && tokenInfo.exp < currentTime) {
        throw new UnauthorizedException('Google token has expired');
      }

      return tokenInfo;
    } catch (error) {
      console.error(
        'Google token verification failed:',
        error.response?.data || error.message,
      );

      // Alternative method: Verify access token
      try {
        const userInfoResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v1/userinfo',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        return {
          email: userInfoResponse.data.email,
          name: userInfoResponse.data.name,
          sub: userInfoResponse.data.id,
          verified: true,
        };
      } catch (secondError) {
        console.error(
          'Alternative verification also failed:',
          secondError.message,
        );
        throw new UnauthorizedException(
          'Invalid Google token. Please try again.',
        );
      }
    }
  }

  async createUser(requestDto: UserRequestDto) {
    const transaction = await this.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    });
    let status = false;
    try {
      // Check if user already exists with email or mobile
      const existingUser = await this.userRepository.findOne({
        where: {
          [Op.or]: [{ email: requestDto.email }, { mobile: requestDto.mobile }],
        },
        transaction: transaction,
      });

      if (existingUser) {
        if (existingUser.email === requestDto.email) {
          throw this.errorMessageService.GeneralErrorCore(
            'User with this email already exists',
            409,
          );
        } else {
          throw this.errorMessageService.GeneralErrorCore(
            'User with this mobile number already exists',
            409,
          );
        }
      }

      const hashedPassword = await bcrypt.hash(requestDto.password, 10);

      const user = await this.userRepository.create(
        {
          name: requestDto.name,
          mobile: requestDto.mobile,
          email: requestDto.email,
          password: hashedPassword,
        } as any,
        {
          transaction,
        },
      );

      if (!user) {
        throw this.errorMessageService.GeneralErrorCore(
          'Unable to create user',
          500,
        );
      }

      await transaction.commit();
      status = true;
      return new UserDto(user);
    } catch (error) {
      if (status == false) {
        await transaction.rollback().catch(() => {});
      }
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async login(email: string, password: string) {
    const transaction = await this.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    });
    let status = false;
    try {
      const user = await this.userRepository.findOne({
        where: { email: email },
        transaction: transaction,
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!user.password) {
        throw new UnauthorizedException('Account not properly configured');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
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
      } as any);

      await transaction.commit();
      status = true;

      return {
        access_token: token,
        user: new UserDto(user),
      };
    } catch (error) {
      if (status == false) {
        await transaction.rollback().catch(() => {});
      }
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async oauthLogin(oauthDto: UserOauthRequestDto) {
    const transaction = await this.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    });
    let status = false;

    try {
      console.log('OAuth Login Request:', {
        provider: oauthDto.provider,
        email: oauthDto.email,
        hasToken: !!oauthDto.token,
      });

      // ✅ IMPORTANT: Verify Google token if provider is google
      if (oauthDto.provider === 'google' && oauthDto.token) {
        console.log('Verifying Google token...');

        try {
          const verifiedData = await this.verifyGoogleToken(oauthDto.token);
          console.log('Google Token Verified:', {
            email: verifiedData.email,
            googleId: verifiedData.sub,
            name: verifiedData.name,
          });

          // Override with verified data
          oauthDto.email = verifiedData.email;
          oauthDto.providerId = verifiedData.sub;

          // Use verified name if available
          if (verifiedData.name && !oauthDto.name) {
            oauthDto.name = verifiedData.name;
          }
        } catch (googleError) {
          console.error(
            'Google token verification failed:',
            googleError.message,
          );
          throw new UnauthorizedException(
            'Invalid Google token: ' + googleError.message,
          );
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

      let user = null as any;

      // First, try to find user by provider + providerId
      if (provider && providerId) {
        user = await this.userRepository.findOne({
          where: { provider, providerId },
          transaction,
        });
        console.log('User found by provider:', user ? 'Yes' : 'No');
      }

      // If not found, try by email
      if (!user && email) {
        user = await this.userRepository.findOne({
          where: { email },
          transaction,
        });
        console.log('User found by email:', user ? 'Yes' : 'No');
      }

      if (user) {
        console.log('Existing user found:', user.email);

        // Update user with OAuth info if missing
        const needsUpdate: any = {};
        if (!user.provider && provider) needsUpdate.provider = provider;
        if (!user.providerId && providerId) needsUpdate.providerId = providerId;
        if (!user.name && name) needsUpdate.name = name;

        if (Object.keys(needsUpdate).length > 0) {
          console.log('Updating user with:', needsUpdate);
          await this.userRepository.update(needsUpdate, {
            where: { id: user.id },
            transaction,
          });
          user = await this.userRepository.findByPk(user.id, { transaction });
        }
      } else {
        console.log('Creating new OAuth user with email:', email);

        // Create new user
        const newUser = await this.userRepository.create(
          {
            name: name,
            mobile: oauthDto.mobile || '',
            email: email || '',
            password: null,
            provider: provider || null,
            providerId: providerId || null,
            isEmailVerified: provider === 'google' ? true : false,
          } as any,
          { transaction },
        );

        if (!newUser) {
          throw this.errorMessageService.GeneralErrorCore(
            'Unable to create user from OAuth data',
            500,
          );
        }

        user = newUser;
        console.log('New user created:', user.id);
      }

      // Generate JWT token
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
      } as any);

      await transaction.commit();
      status = true;

      console.log('OAuth login successful for user:', user.email);

      return {
        access_token: token,
        user: new UserDto(user),
        message: 'Login successful',
      };
    } catch (error) {
      console.error('OAuth login error:', error.message);
      if (status == false) {
        await transaction.rollback().catch(() => {});
      }

      // Return proper error message
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async updateUser(id: string, requestDto: UserPutRequestDto) {
    const transaction = await this.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    });
    let status = false;

    try {
      const oldUser = await this.userRepository.findByPk(id, {
        transaction,
      });

      if (!oldUser) {
        throw this.errorMessageService.GeneralErrorCore('User not found', 404);
      }

      // Check if email is being changed and if new email already exists
      if (requestDto.email && requestDto.email !== oldUser.email) {
        const existingUser = await this.userRepository.findOne({
          where: {
            email: requestDto.email,
            id: { [Op.ne]: id },
          },
          transaction,
        });

        if (existingUser) {
          throw this.errorMessageService.GeneralErrorCore(
            'User with this email already exists',
            409,
          );
        }
      }

      // Check if mobile is being changed and if new mobile already exists
      if (requestDto.mobile && requestDto.mobile !== oldUser.mobile) {
        const existingUser = await this.userRepository.findOne({
          where: {
            mobile: requestDto.mobile,
            id: { [Op.ne]: id },
          },
          transaction,
        });

        if (existingUser) {
          throw this.errorMessageService.GeneralErrorCore(
            'User with this mobile number already exists',
            409,
          );
        }
      }

      // Prepare update fields
      const updateFields: Partial<User> = {
        name: requestDto.name,
        mobile: requestDto.mobile,
        email: requestDto.email,
      };

      // Only update password if provided
      if (requestDto.password && requestDto.password.trim() !== '') {
        updateFields.password = await bcrypt.hash(requestDto.password, 10);
      }

      const [updateCount] = await this.userRepository.update(updateFields, {
        where: { id },
        transaction,
      });

      if (updateCount === 0) {
        throw this.errorMessageService.GeneralErrorCore(
          'Failed to update user',
          500,
        );
      }

      await transaction.commit();
      status = true;

      const updatedUser = await this.userRepository.findByPk(id);

      if (!updatedUser) {
        throw this.errorMessageService.GeneralErrorCore(
          'Failed to fetch updated user',
          500,
        );
      }

      return new UserDto(updatedUser);
    } catch (error) {
      if (status === false) {
        await transaction.rollback().catch(() => {});
      }
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async getUser(id: string) {
    try {
      const user = await this.userRepository.findByPk(id);

      if (!user) {
        throw this.errorMessageService.GeneralErrorCore('User not found', 404);
      }

      return new UserDto(user);
    } catch (error) {
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async getUserByEmail(email: string) {
    try {
      if (!email || email.trim() === '') {
        throw this.errorMessageService.GeneralErrorCore(
          'Email is required',
          400,
        );
      }

      const user = await this.userRepository.findOne({
        where: { email: email.trim().toLowerCase() },
      });

      if (!user) {
        throw this.errorMessageService.GeneralErrorCore(
          'User not found with this email',
          404,
        );
      }

      return new UserDto(user);
    } catch (error) {
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async getUsersByName(name: string) {
    try {
      if (!name || name.trim() === '') {
        throw this.errorMessageService.GeneralErrorCore(
          'Name is required for search',
          400,
        );
      }

      const users = await this.userRepository.findAll({
        where: {
          name: {
            [Op.iLike]: `%${name.trim()}%`,
          },
        },
      });

      if (!users || users.length === 0) {
        throw this.errorMessageService.GeneralErrorCore(
          'No users found with this name',
          404,
        );
      }

      return users.map((user) => new UserDto(user));
    } catch (error) {
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async getUsersByEmailOrName(email?: string, name?: string) {
    try {
      const whereCondition: any = {};

      if (email && email.trim() !== '') {
        whereCondition.email = email.trim().toLowerCase();
      }

      if (name && name.trim() !== '') {
        whereCondition.name = {
          [Op.iLike]: `%${name.trim()}%`,
        };
      }

      if (Object.keys(whereCondition).length === 0) {
        throw this.errorMessageService.GeneralErrorCore(
          'Please provide either email or name for search',
          400,
        );
      }

      const users = await this.userRepository.findAll({
        where: whereCondition,
      });

      if (!users || users.length === 0) {
        throw this.errorMessageService.GeneralErrorCore(
          'No users found with the given criteria',
          404,
        );
      }

      return users.map((user) => new UserDto(user));
    } catch (error) {
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async getAllUsers(requestDto?: any) {
    try {
      const users = await this.userRepository.findAll({
        order: [['createdAt', 'DESC']],
      });

      if (!users || users.length === 0) {
        throw this.errorMessageService.GeneralErrorCore('No users found', 404);
      }

      return users.map((user) => new UserDto(user));
    } catch (error) {
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async deleteUser(id: string) {
    const transaction = await this.sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
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
    } catch (error) {
      if (status == false) {
        await transaction.rollback().catch(() => {});
      }
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async searchUsers(criteria: {
    email?: string;
    name?: string;
    mobile?: string;
  }) {
    try {
      const whereCondition: any = {};

      if (criteria.email && criteria.email.trim() !== '') {
        whereCondition.email = criteria.email.trim().toLowerCase();
      }

      if (criteria.name && criteria.name.trim() !== '') {
        whereCondition.name = {
          [Op.iLike]: `%${criteria.name.trim()}%`,
        };
      }

      if (criteria.mobile && criteria.mobile.trim() !== '') {
        whereCondition.mobile = criteria.mobile.trim();
      }

      if (Object.keys(whereCondition).length === 0) {
        throw this.errorMessageService.GeneralErrorCore(
          'Please provide at least one search criteria (email, name, or mobile)',
          400,
        );
      }

      const users = await this.userRepository.findAll({
        where: whereCondition,
        order: [['createdAt', 'DESC']],
      });

      if (!users || users.length === 0) {
        throw this.errorMessageService.GeneralErrorCore(
          'No users found with the given criteria',
          404,
        );
      }

      return users.map((user) => new UserDto(user));
    } catch (error) {
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async getUsersWithPagination(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    try {
      const offset = (page - 1) * limit;
      const whereCondition: any = {};

      if (search && search.trim() !== '') {
        whereCondition[Op.or] = [
          { name: { [Op.iLike]: `%${search.trim()}%` } },
          { email: { [Op.iLike]: `%${search.trim()}%` } },
          { mobile: { [Op.iLike]: `%${search.trim()}%` } },
        ];
      }

      const { count, rows } = await this.userRepository.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        users: rows.map((user) => new UserDto(user)),
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw this.errorMessageService.CatchHandler(error);
    }
  }
}
