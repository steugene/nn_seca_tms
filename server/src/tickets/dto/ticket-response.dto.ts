import { ApiProperty } from "@nestjs/swagger";
import { UserResponseDto } from "../../auth/dto/auth-response.dto";
import { ColumnResponseDto } from "../../boards/dto/board-response.dto";

export class TicketResponseDto {
  @ApiProperty({
    example: "uuid-string",
    description: "Ticket ID",
  })
  id: string;

  @ApiProperty({
    example: "Fix login bug",
    description: "Ticket title",
  })
  title: string;

  @ApiProperty({
    example: "Users cannot log in with valid credentials",
    description: "Ticket description",
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: "HIGH",
    description: "Ticket priority",
    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
  })
  priority: string;

  @ApiProperty({
    example: "TODO",
    description: "Ticket status",
    enum: ["TODO", "IN_PROGRESS", "TESTING", "DONE"],
  })
  status: string;

  @ApiProperty({
    example: "uuid-string",
    description: "ID of assigned user",
    required: false,
  })
  assignedTo?: string;

  @ApiProperty({
    example: "uuid-string",
    description: "ID of user who created the ticket",
  })
  createdBy: string;

  @ApiProperty({
    example: "uuid-string",
    description: "ID of column containing the ticket",
  })
  columnId: string;

  @ApiProperty({
    example: "uuid-string",
    description: "ID of board containing the ticket",
  })
  boardId: string;

  @ApiProperty({
    example: 0,
    description: "Order position in column",
  })
  order: number;

  @ApiProperty({
    type: UserResponseDto,
    description: "User assigned to ticket",
    required: false,
  })
  assignedUser?: UserResponseDto;

  @ApiProperty({
    type: UserResponseDto,
    description: "User who created the ticket",
    required: false,
  })
  createdByUser?: UserResponseDto;

  @ApiProperty({
    type: ColumnResponseDto,
    description: "Column containing the ticket",
    required: false,
  })
  column?: ColumnResponseDto;

  @ApiProperty({
    example: "2024-01-15T10:30:00Z",
    description: "Ticket creation date",
  })
  createdAt: Date;

  @ApiProperty({
    example: "2024-01-15T10:30:00Z",
    description: "Last update date",
  })
  updatedAt: Date;
}
