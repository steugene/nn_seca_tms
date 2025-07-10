import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({
    example: "uuid-string",
    description: "User ID",
  })
  id: string;

  @ApiProperty({
    example: "john.doe@example.com",
    description: "User email",
  })
  email: string;

  @ApiProperty({
    example: "johndoe",
    description: "Username",
  })
  username: string;

  @ApiProperty({
    example: "John",
    description: "First name",
  })
  firstName: string;

  @ApiProperty({
    example: "Doe",
    description: "Last name",
  })
  lastName: string;

  @ApiProperty({
    example: "https://example.com/avatar.jpg",
    description: "User avatar URL",
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    example: "2024-01-15T10:30:00Z",
    description: "Account creation date",
  })
  createdAt: Date;

  @ApiProperty({
    example: "2024-01-15T10:30:00Z",
    description: "Last update date",
  })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    type: UserResponseDto,
    description: "User information",
  })
  user: UserResponseDto;

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "JWT access token",
  })
  accessToken: string;

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "JWT refresh token",
  })
  refreshToken: string;
}
