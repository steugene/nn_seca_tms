import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Ticket } from "../entities/ticket.entity";
import { Column } from "../entities/column.entity";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { UpdateTicketDto } from "./dto/update-ticket.dto";
import { MoveTicketDto } from "./dto/move-ticket.dto";
import { TicketStatus } from "@nn-seca-tms/shared";

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(Column)
    private columnsRepository: Repository<Column>,
  ) {}

  async create(
    createTicketDto: CreateTicketDto,
    userId: string,
  ): Promise<Ticket> {
    const column = await this.columnsRepository.findOne({
      where: { id: createTicketDto.columnId },
    });

    if (!column) {
      throw new NotFoundException(
        `Column with ID ${createTicketDto.columnId} not found`,
      );
    }

    const ticketCount = await this.ticketsRepository.count({
      where: { columnId: createTicketDto.columnId },
    });

    const ticket = this.ticketsRepository.create({
      ...createTicketDto,
      createdBy: userId,
      order: ticketCount,
      status: this.getStatusFromColumnTitle(column.title),
    });

    const savedTicket = await this.ticketsRepository.save(ticket);
    return this.findOne(savedTicket.id);
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      relations: ["assignedUser", "createdByUser", "column", "board"],
      order: {
        createdAt: "DESC",
      },
    });
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ["assignedUser", "createdByUser", "column", "board"],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async update(
    id: string,
    updateTicketDto: UpdateTicketDto,
    _userId: string,
  ): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (
      updateTicketDto.columnId &&
      updateTicketDto.columnId !== ticket.columnId
    ) {
      const newColumn = await this.columnsRepository.findOne({
        where: { id: updateTicketDto.columnId },
      });

      if (!newColumn) {
        throw new NotFoundException(
          `Column with ID ${updateTicketDto.columnId} not found`,
        );
      }

      const ticketCount = await this.ticketsRepository.count({
        where: { columnId: updateTicketDto.columnId },
      });

      updateTicketDto.order = updateTicketDto.order ?? ticketCount;

      Object.assign(ticket, updateTicketDto);
      ticket.status = this.getStatusFromColumnTitle(newColumn.title);
    }

    Object.assign(ticket, updateTicketDto);
    await this.ticketsRepository.save(ticket);

    return this.findOne(id);
  }

  async remove(id: string, _userId: string): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketsRepository.remove(ticket);
  }

  async move(moveTicketDto: MoveTicketDto, _userId: string): Promise<Ticket> {
    const ticket = await this.findOne(moveTicketDto.ticketId);
    const oldColumnId = ticket.columnId;

    const newColumn = await this.columnsRepository.findOne({
      where: { id: moveTicketDto.columnId },
    });

    if (!newColumn) {
      throw new NotFoundException(
        `Column with ID ${moveTicketDto.columnId} not found`,
      );
    }

    await this.ticketsRepository
      .createQueryBuilder()
      .update(Ticket)
      .set({ order: () => '"order" + 1' })
      .where("columnId = :columnId", { columnId: moveTicketDto.columnId })
      .andWhere("order >= :order", { order: moveTicketDto.order })
      .execute();

    const newStatus = this.getStatusFromColumnTitle(newColumn.title);

    await this.ticketsRepository
      .createQueryBuilder()
      .update(Ticket)
      .set({
        columnId: moveTicketDto.columnId,
        order: moveTicketDto.order,
        status: newStatus,
        updatedAt: () => "CURRENT_TIMESTAMP",
      })
      .where("id = :id", { id: moveTicketDto.ticketId })
      .execute();

    if (oldColumnId !== moveTicketDto.columnId) {
      await this.ticketsRepository
        .createQueryBuilder()
        .update(Ticket)
        .set({ order: () => '"order" - 1' })
        .where("columnId = :columnId", { columnId: oldColumnId })
        .andWhere("order > :order", { order: ticket.order })
        .execute();
    }

    await this.ticketsRepository.manager.connection.queryResultCache?.remove([
      "ticket",
      moveTicketDto.ticketId,
    ]);

    const finalTicket = await this.findOne(moveTicketDto.ticketId);

    return finalTicket;
  }

  async findByBoard(boardId: string): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      where: { boardId },
      relations: ["assignedUser", "createdByUser", "column"],
      order: {
        order: "ASC",
      },
    });
  }

  async findByUser(userId: string): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      where: [{ assignedTo: userId }, { createdBy: userId }],
      relations: ["assignedUser", "createdByUser", "column", "board"],
      order: {
        createdAt: "DESC",
      },
    });
  }

  private getStatusFromColumnTitle(columnTitle: string): TicketStatus {
    switch (columnTitle.toLowerCase()) {
      case "to do":
        return TicketStatus.TODO;
      case "in progress":
        return TicketStatus.IN_PROGRESS;
      case "testing":
        return TicketStatus.TESTING;
      case "done":
        return TicketStatus.DONE;
      default:
        return TicketStatus.TODO;
    }
  }
}
