import { ApiProperty } from '@nestjs/swagger';

export class UserDetailProfileDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  phone: string;
}

export class UserDetailResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: UserDetailProfileDto })
  profile: UserDetailProfileDto;
}