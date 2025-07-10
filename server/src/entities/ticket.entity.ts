import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Board } from "./board.entity";
import { Column as BoardColumn } from "./column.entity";
import { TicketPriority, TicketStatus } from "@nn-seca-tms/shared";

@Entity("tickets")
export class Ticket {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @Column({
    type: "enum",
    enum: TicketStatus,
    default: TicketStatus.TODO,
  })
  status: TicketStatus;

  @Column({ nullable: true })
  assignedTo?: string;

  @Column()
  createdBy: string;

  @Column()
  columnId: string;

  @Column()
  boardId: string;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => User, (user) => user.assignedTickets)
  @JoinColumn({ name: "assignedTo" })
  assignedUser?: User;

  @ManyToOne(() => User, (user) => user.createdTickets)
  @JoinColumn({ name: "createdBy" })
  createdByUser: User;

  @ManyToOne(() => BoardColumn, (column) => column.tickets)
  @JoinColumn({ name: "columnId" })
  column: BoardColumn;

  @ManyToOne(() => Board, (board) => board.tickets)
  @JoinColumn({ name: "boardId" })
  board: Board;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
