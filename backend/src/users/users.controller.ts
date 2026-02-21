import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

class CreateUserResponseDto {
  id: string;
}

class UserDetailProfileDto {
  firstName: string | null;
  lastName: string | null;
  birthDate: Date | null;
  phone: string | null;
}

class UserDetailResponseDto {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  profile: UserDetailProfileDto;
}

class UserListProfileDto {
  firstName: string | null;
  lastName: string | null;
}

class UserListItemResponseDto {
  id: string;
  email: string;
  role: string;
  profile: UserListProfileDto;
}

class UsersListResponseDto {
  page: number;
  limit: number;
  total: number;
  items: UserListItemResponseDto[];
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({
    description: 'User successfully created',
    type: CreateUserResponseDto,
  })
  @ApiConflictResponse({ description: 'Email already exists' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: UserDetailResponseDto })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get users list with profile (paginated + search + sort)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'juan' })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    example: 'createdAt',
    description:
      "Allowed: createdAt, email, role, profile.firstName, profile.lastName",
  })
  @ApiQuery({
    name: 'order',
    required: false,
    type: String,
    example: 'desc',
    description: "Allowed: asc, desc",
  })
  @ApiOkResponse({ type: UsersListResponseDto })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    const p = page == null ? 1 : Number(page);
    const l = limit == null ? 10 : Number(limit);
    const o = order === 'asc' ? 'asc' : 'desc';
    return this.usersService.findAll(p, l, search, sort, o);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: UserDetailResponseDto })
  @ApiConflictResponse({ description: 'Email already exists' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete user by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse({ description: 'User deleted' })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }
}