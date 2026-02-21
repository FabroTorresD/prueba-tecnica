import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Perez' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @ApiPropertyOptional({ example: '1995-03-20' })
  @IsOptional()
  @IsDateString()
  birthDate?: string | null;

  @ApiPropertyOptional({ example: '3515551234' })
  @IsOptional()
  @IsString()
  phone?: string | null;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'nuevo@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: ['USER', 'ADMIN'], example: 'ADMIN' })
  @IsOptional()
  @IsEnum(['USER', 'ADMIN'])
  role?: 'USER' | 'ADMIN';

  @ApiPropertyOptional({ type: UpdateProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  profile?: UpdateProfileDto;
}