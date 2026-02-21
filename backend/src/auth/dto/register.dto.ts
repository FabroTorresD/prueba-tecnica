import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class RegisterProfileDto {
  @ApiProperty({
    example: 'Mateo',
    description: 'Nombre del usuario',
  })
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty({
    example: 'Gonzalez',
    description: 'Apellido del usuario',
  })
  @IsString()
  @MinLength(1)
  lastName: string;

  @ApiPropertyOptional({
    example: '1995-08-21',
    description: 'Fecha de nacimiento en formato ISO (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    example: '+5493511234567',
    description: 'Teléfono del usuario',
  })
  @IsOptional()
  @IsString()
  phone?: string | null;
}

export class RegisterDto {
  @ApiProperty({
    example: 'mateo.gonzalez@gmail.com',
    description: 'Email del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    type: RegisterProfileDto,
  })
  @ValidateNested()
  @Type(() => RegisterProfileDto)
  profile: RegisterProfileDto;
}