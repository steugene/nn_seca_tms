import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { BoardsService } from "./boards.service";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { BoardResponseDto } from "./dto/board-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Board } from "@nn-seca-tms/shared";

@ApiTags("Boards")
@Controller("boards")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new board" })
  @ApiResponse({
    status: 201,
    description: "Board created successfully",
    type: BoardResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Bearer token required",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 401 },
        message: { type: "string", example: "Unauthorized" },
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
          example: ["title must be longer than or equal to 3 characters"],
        },
        error: { type: "string", example: "Bad Request" },
      },
    },
  })
  async create(
    @Body() createBoardDto: CreateBoardDto,
    @Request() req,
  ): Promise<Board> {
    return this.boardsService.create(createBoardDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all boards" })
  @ApiResponse({
    status: 200,
    description: "Boards retrieved successfully",
    type: [BoardResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Bearer token required",
  })
  async findAll(): Promise<Board[]> {
    return this.boardsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a board by ID" })
  @ApiResponse({
    status: 200,
    description: "Board retrieved successfully",
    type: BoardResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Board not found",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 404 },
        message: {
          type: "string",
          example: "Board with ID uuid-string not found",
        },
        error: { type: "string", example: "Not Found" },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Bearer token required",
  })
  @ApiParam({ name: "id", description: "Board ID", example: "uuid-string" })
  async findOne(@Param("id") id: string): Promise<Board> {
    return this.boardsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a board" })
  @ApiResponse({ status: 200, description: "Board updated successfully" })
  @ApiResponse({ status: 404, description: "Board not found" })
  @ApiParam({ name: "id", description: "Board ID" })
  async update(
    @Param("id") id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @Request() req,
  ): Promise<Board> {
    return this.boardsService.update(id, updateBoardDto, req.user.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a board" })
  @ApiResponse({ status: 200, description: "Board deleted successfully" })
  @ApiResponse({ status: 404, description: "Board not found" })
  @ApiParam({ name: "id", description: "Board ID" })
  async remove(
    @Param("id") id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    await this.boardsService.remove(id, req.user.id);
    return { message: "Board deleted successfully" };
  }
}
