import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TicketsService } from "./tickets.service";
import { TicketsController } from "./tickets.controller";
import { Ticket } from "../entities/ticket.entity";
import { Column } from "../entities/column.entity";
import { WebsocketModule } from "../websocket/websocket.module";

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Column]), WebsocketModule],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
