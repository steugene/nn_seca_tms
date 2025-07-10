import { Module } from "@nestjs/common";
import { AppWebSocketGateway as WSGateway } from "./websocket.gateway";

@Module({
  providers: [WSGateway],
  exports: [WSGateway],
})
export class WebsocketModule {}
