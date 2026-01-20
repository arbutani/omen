/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ErrorMessageService } from '../../common/services/errormessage.service';

import { UserRequestDto } from '../dto/userRequest.dto';
import { UserService } from '../service/user.service';
import { JwtAuthGuard } from 'src/JwtAuthGuard/jwt_auth.guard';
import { Public } from 'src/JwtAuthGuard/public.decorator';
import { UserPutRequestDto } from '../dto/userPutRequest.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly errorMessageService: ErrorMessageService,
  ) { }

  @Public()
  @Post()
  async createUser(
    @Body() requestDto: UserRequestDto,
  ): Promise<any> {
    try {
      const user = await this.userService.createUser(requestDto);
      return this.errorMessageService.success(
        user,
        true,
        'User created successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @Public()
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      const result = await this.userService.login(body.email, body.password);
      return this.errorMessageService.success(
        result,
        true,
        'Login successful',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() requestDto: UserPutRequestDto,
  ): Promise<any> {
    try {
      const user = await this.userService.updateUser(id, requestDto);
      return this.errorMessageService.success(
        user,
        true,
        'User updated successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<any> {
    try {
      const user = await this.userService.getUser(id);
      return this.errorMessageService.success(
        user,
        true,
        'User retrieved successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @Public()
  @Get('email/:email')
  async getUserByEmail(
    @Param('email') email: string,
  ): Promise<any> {
    try {
      const user = await this.userService.getUserByEmail(email);
      return this.errorMessageService.success(
        user,
        true,
        'User retrieved successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('search/by-name/:name')
  async getUsersByName(
    @Param('name') name: string,
  ): Promise<any> {
    try {
      const users = await this.userService.getUsersByName(name);
      return this.errorMessageService.success(
        users,
        true,
        'Users retrieved successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('search/by-credentials')
  async getUsersByEmailOrName(
    @Query('email') email?: string,
    @Query('name') name?: string,
  ): Promise<any> {
    try {
      const users = await this.userService.getUsersByEmailOrName(email, name);
      return this.errorMessageService.success(
        users,
        true,
        'Users retrieved successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ): Promise<any> {
    try {
      if (page || limit || search) {
        const pageNum = page ? Number(page) : 1;
        const limitNum = limit ? Number(limit) : 10;
        return await this.userService.getUsersWithPagination(
          pageNum,
          limitNum,
          search,
        );
      } else {
        const users = await this.userService.getAllUsers();
        return this.errorMessageService.success(
          users,
          true,
          'Users retrieved successfully',
          {},
        );
      }
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<any> {
    try {
      const result = await this.userService.deleteUser(id);
      return this.errorMessageService.success(
        result,
        true,
        'User deleted successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('search/advanced')
  async searchUsers(
    @Query('email') email?: string,
    @Query('name') name?: string,
    @Query('mobile') mobile?: string,
  ): Promise<any> {
    try {
      const users = await this.userService.searchUsers({ email, name, mobile });
      return this.errorMessageService.success(
        users,
        true,
        'Users retrieved successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }
}
