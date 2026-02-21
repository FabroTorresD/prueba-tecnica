import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

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
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
  })
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
  @ApiOperation({ summary: 'Get users list with profile (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({ type: UsersListResponseDto })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page == null ? 1 : Number(page);
    const l = limit == null ? 10 : Number(limit);
    return this.usersService.findAll(p, l);
  }
}