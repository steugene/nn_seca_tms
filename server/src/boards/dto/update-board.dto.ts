import { IsString, IsOptional, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateBoardDto {
  @ApiProperty({
    example: "Updated Project Board",
    description: "Board title",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    example: "Updated board description",
    description: "Board description",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
