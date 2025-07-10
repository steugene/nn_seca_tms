import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  MinLength,
  MaxLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { TicketPriority } from "@nn-seca-tms/shared";

export class CreateTicketDto {
  @ApiProperty({
    example: "Fix login bug",
    description: "Ticket title",
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: "Users cannot log in with valid credentials",
    description: "Ticket description",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    example: "HIGH",
    description: "Ticket priority",
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @ApiProperty({
    example: "uuid-of-user",
    description: "ID of user assigned to ticket",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiProperty({
    example: "uuid-of-column",
    description: "ID of column where ticket will be placed",
  })
  @IsUUID()
  columnId: string;

  @ApiProperty({
    example: "uuid-of-board",
    description: "ID of board where ticket will be placed",
  })
  @IsUUID()
  boardId: string;
}
