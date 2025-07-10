import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Board } from "./board.entity";
import { Ticket } from "./ticket.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar?: string;

  @OneToMany(() => Board, (board) => board.createdByUser)
  boards: Board[];

  @OneToMany(() => Ticket, (ticket) => ticket.createdByUser)
  createdTickets: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.assignedUser)
  assignedTickets: Ticket[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
