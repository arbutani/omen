/* eslint-disable prettier/prettier */
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorMessageService } from 'src/shared/services/errormessage.service';
import moment from 'moment';
import { Op, Sequelize, Transaction } from 'sequelize';
import { User } from '../entity/user.entity';
import { UserRequestDto } from '../dto/userRequest.dto';
import { UserDto } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserPutRequestDto } from '../dto/userPutRequest.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: typeof User,
    @Inject('SEQUELIZE')
    private readonly sequelize: Sequelize,
    private readonly errorMessageService: ErrorMessageService,
    private readonly jwtService: JwtService,
  ) {}

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
