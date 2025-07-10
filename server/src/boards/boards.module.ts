import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BoardsService } from "./boards.service";
import { BoardsController } from "./boards.controller";
import { Board } from "../entities/board.entity";
import { Column } from "../entities/column.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Board, Column])],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
