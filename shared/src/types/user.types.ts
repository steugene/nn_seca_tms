export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
} 