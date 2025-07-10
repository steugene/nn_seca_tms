import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Column as BoardColumn } from "./column.entity";
import { Ticket } from "./ticket.entity";

@Entity("boards")
export class Board {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  createdBy: string;

  @ManyToOne(() => User, (user) => user.boards)
  @JoinColumn({ name: "createdBy" })
  createdByUser: User;

  @OneToMany(() => BoardColumn, (column) => column.board, { cascade: true })
  columns: BoardColumn[];

  @OneToMany(() => Ticket, (ticket) => ticket.board)
  tickets: Ticket[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
