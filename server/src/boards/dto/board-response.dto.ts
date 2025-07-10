import { ApiProperty } from "@nestjs/swagger";

export class BoardResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => ColumnResponseDto, isArray: true })
  columns: ColumnResponseDto[];

  @ApiProperty({ type: () => TicketResponseDto, isArray: true })
  tickets?: TicketResponseDto[];
}

export class ColumnResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  boardId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class TicketResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  priority: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  columnId: string;

  @ApiProperty()
  boardId: string;

  @ApiProperty()
  assignedTo: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
