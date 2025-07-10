import { IsUUID, IsNumber, Min, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class MoveTicketDto {
  @ApiProperty({
    example: "uuid-of-ticket",
    description: "ID of ticket to move",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  ticketId?: string;

  @ApiProperty({
    example: "uuid-of-column",
    description: "ID of destination column",
  })
  @IsUUID()
  columnId: string;

  @ApiProperty({
    example: 0,
    description: "New order position in column",
  })
  @IsNumber()
  @Min(0)
  order: number;
}
