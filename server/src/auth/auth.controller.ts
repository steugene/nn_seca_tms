import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { AuthResponse } from "@nn-seca-tms/shared";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({
    status: 201,
    description: "User successfully registered",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Email or username already exists",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 409 },
        message: { type: "string", example: "Email already exists" },
        error: { type: "string", example: "Conflict" },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Validation error",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 400 },
        message: {
          type: "array",
          items: { type: "string" },
          example: ["Password must contain at least one uppercase letter"],
        },
        error: { type: "string", example: "Bad Request" },
      },
    },
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({
    status: 200,
    description: "User successfully logged in",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 401 },
        message: { type: "string", example: "Invalid credentials" },
        error: { type: "string", example: "Unauthorized" },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Validation error",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 400 },
        message: {
          type: "array",
          items: { type: "string" },
          example: ["email must be an email"],
        },
        error: { type: "string", example: "Bad Request" },
      },
    },
  })
  @ApiBody({ type: LoginDto })
  async login(
    @Request() req,
    @Body() loginDto: LoginDto,
  ): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
}
