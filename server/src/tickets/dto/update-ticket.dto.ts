import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  MinLength,
  MaxLength,
  IsNumber,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { TicketPriority } from "@nn-seca-tms/shared";

export class UpdateTicketDto {
  @ApiProperty({
    example: "Updated ticket title",
    description: "Ticket title",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    example: "Updated ticket description",
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
    required: false,
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

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
    description: "ID of column where ticket will be moved",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  columnId?: string;

  @ApiProperty({
    example: 0,
    description: "Order position in column",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  order?: number;
}
