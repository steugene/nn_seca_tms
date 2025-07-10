import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserResponseDto } from "../auth/dto/auth-response.dto";
import { User } from "@nn-seca-tms/shared";

@ApiTags("Users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "Users retrieved successfully", type: [UserResponseDto] })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get("profile")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile retrieved successfully", type: UserResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfile(@Request() req): Promise<User> {
    return req.user;
  }
}
