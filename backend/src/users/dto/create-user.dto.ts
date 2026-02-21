import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProfileDto {
  @ApiProperty({
    example: 'Ana',
    description: 'User first name',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Perez',
    description: 'User last name',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({
    example: '1995-04-12',
    description: 'Birth date (ISO format)',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    example: '351123456',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateUserDto {
  @ApiProperty({
    example: 'ana@mail.com',
    description: 'User email (must be unique)',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'User password (min 6 characters)',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: 'USER',
    enum: ['USER', 'ADMIN'],
    description: 'User role',
  })
  @IsOptional()
  @IsEnum(['USER', 'ADMIN'])
  role?: 'USER' | 'ADMIN';

  @ApiProperty({
    description: 'Embedded profile object',
    type: ProfileDto,
  })
  @ValidateNested()
  @Type(() => ProfileDto)
  profile: ProfileDto;
}