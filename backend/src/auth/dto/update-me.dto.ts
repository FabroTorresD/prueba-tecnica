import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

class UpdateMeProfileDto {
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

  @ApiPropertyOptional({ example: '"3515551234"' })
  @IsOptional()
  @IsString()
  phone?: string | null;
}

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'nuevo@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ type: UpdateMeProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateMeProfileDto)
  profile?: UpdateMeProfileDto;
}