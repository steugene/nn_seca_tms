import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { User } from "../entities/user.entity";
import { TicketsService } from "./tickets.service";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { UpdateTicketDto } from "./dto/update-ticket.dto";
import { MoveTicketDto } from "./dto/move-ticket.dto";
import { TicketResponseDto } from "./dto/ticket-response.dto";
import { AppWebSocketGateway } from "../websocket/websocket.gateway";

@ApiTags("Tickets")
@Controller("tickets")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly webSocketGateway: AppWebSocketGateway,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new ticket" })
  @ApiResponse({
    status: 201,
    description: "Ticket created successfully",
    type: TicketResponseDto,
  })
  async create(
    @Body() createTicketDto: CreateTicketDto,
    @CurrentUser() user: User,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.create(createTicketDto, user.id);
    this.webSocketGateway.emitTicketCreated(ticket);
    return ticket;
  }

  @Get()
  @ApiOperation({ summary: "Get all tickets" })
  @ApiResponse({
    status: 200,
    description: "List of all tickets",
    type: [TicketResponseDto],
  })
  async findAll(): Promise<TicketResponseDto[]> {
    return await this.ticketsService.findAll();
  }

  @Get("board/:boardId")
  @ApiOperation({ summary: "Get all tickets for a specific board" })
  @ApiResponse({
    status: 200,
    description: "List of tickets for the board",
    type: [TicketResponseDto],
  })
  async findByBoard(
    @Param("boardId") boardId: string,
  ): Promise<TicketResponseDto[]> {
    return await this.ticketsService.findByBoard(boardId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a ticket by ID" })
  @ApiResponse({
    status: 200,
    description: "Ticket found",
    type: TicketResponseDto,
  })
  @ApiResponse({ status: 404, description: "Ticket not found" })
  async findOne(@Param("id") id: string): Promise<TicketResponseDto> {
    return await this.ticketsService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a ticket" })
  @ApiResponse({
    status: 200,
    description: "Ticket updated successfully",
    type: TicketResponseDto,
  })
  @ApiResponse({ status: 404, description: "Ticket not found" })
  async update(
    @Param("id") id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @CurrentUser() user: User,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.update(id, updateTicketDto, user.id);
    this.webSocketGateway.emitTicketUpdated(ticket);
    return ticket;
  }

  @Put(":id/move")
  @ApiOperation({ summary: "Move a ticket to a different column" })
  @ApiResponse({
    status: 200,
    description: "Ticket moved successfully",
    type: TicketResponseDto,
  })
  @ApiResponse({ status: 404, description: "Ticket not found" })
  async move(
    @Param("id") id: string,
    @Body() moveTicketDto: MoveTicketDto,
    @CurrentUser() user: User,
  ): Promise<TicketResponseDto> {
    const originalTicket = await this.ticketsService.findOne(id);
    const moveData = { ...moveTicketDto, ticketId: id };
    const movedTicket = await this.ticketsService.move(moveData, user.id);
    
    this.webSocketGateway.emitTicketMoved({
      ticket: movedTicket,
      oldColumnId: originalTicket.columnId,
      newColumnId: movedTicket.columnId,
      boardId: movedTicket.boardId,
    });
    
    return movedTicket;
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a ticket" })
  @ApiResponse({ status: 200, description: "Ticket deleted successfully" })
  @ApiResponse({ status: 404, description: "Ticket not found" })
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    const ticket = await this.ticketsService.findOne(id);
    await this.ticketsService.remove(id, user.id);
    this.webSocketGateway.emitTicketDeleted(ticket.id, ticket.boardId);
    return { message: "Ticket deleted successfully" };
  }
}
