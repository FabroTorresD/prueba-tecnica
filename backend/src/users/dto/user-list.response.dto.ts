import { ApiProperty } from '@nestjs/swagger';

export class UserListProfileDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;
}

export class UserListItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;

  @ApiProperty({ type: UserListProfileDto })
  profile: UserListProfileDto;
}

export class UserListResponseDto {
  @ApiProperty({ type: [UserListItemResponseDto] })
  items: UserListItemResponseDto[];

  @ApiProperty()
  total: number;
}