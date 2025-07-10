import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";
import { Board } from "../entities/board.entity";
import { Column } from "../entities/column.entity";
import { Ticket } from "../entities/ticket.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "nn_seca_tms",
  entities: [User, Board, Column, Ticket],
  migrations: ["src/database/migrations/*.ts"],
  migrationsTableName: "migrations",
  synchronize: false,
});
