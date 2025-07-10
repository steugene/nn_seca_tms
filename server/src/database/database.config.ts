import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Board } from "../entities/board.entity";
import { Column } from "../entities/column.entity";
import { Ticket } from "../entities/ticket.entity";

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "nn_seca_tms",
  entities: [User, Board, Column, Ticket],
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  migrations: ["dist/database/migrations/*.js"],
  migrationsTableName: "migrations",
  retryAttempts: 3,
  retryDelay: 3000,
  autoLoadEntities: true,
  keepConnectionAlive: true,
});
