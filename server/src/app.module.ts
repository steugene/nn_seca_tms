import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { BoardsModule } from "./boards/boards.module";
import { TicketsModule } from "./tickets/tickets.module";
import { WebsocketModule } from "./websocket/websocket.module";
import { databaseConfig } from "./database/database.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    AuthModule,
    UsersModule,
    BoardsModule,
    TicketsModule,
    WebsocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
