import { IsString, IsOptional, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBoardDto {
  @ApiProperty({
    example: "My Project Board",
    description: "Board title",
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: "A board for tracking project tasks",
    description: "Board description",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
