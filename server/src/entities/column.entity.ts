import {
  Entity,
  PrimaryGeneratedColumn,
  Column as ColumnDecorator,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Board } from "./board.entity";
import { Ticket } from "./ticket.entity";

@Entity("columns")
export class Column {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ColumnDecorator()
  title: string;

  @ColumnDecorator()
  boardId: string;

  @ColumnDecorator({ default: 0 })
  order: number;

  @ManyToOne(() => Board, (board) => board.columns)
  @JoinColumn({ name: "boardId" })
  board: Board;

  @OneToMany(() => Ticket, (ticket) => ticket.column)
  tickets: Ticket[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
