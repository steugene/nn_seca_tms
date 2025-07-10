import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { TicketMovedEvent, WebSocketEvents } from "@nn-seca-tms/shared";

interface JoinBoardEvent {
  userId: string;
  boardId: string;
  username: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:4200",
    credentials: true,
  },
})
export class AppWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();
  private boardUsers = new Map<string, Set<string>>();

  handleConnection(_client: Socket) {}

  handleDisconnect(client: Socket) {
    let userIdToRemove: string | undefined;

    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        userIdToRemove = userId;
        break;
      }
    }

    if (userIdToRemove) {
      this.userSockets.delete(userIdToRemove);

      for (const [boardId, users] of this.boardUsers.entries()) {
        if (users.has(userIdToRemove)) {
          users.delete(userIdToRemove);
          if (users.size === 0) {
            this.boardUsers.delete(boardId);
          }
          void this.emitUserLeftBoard(boardId, userIdToRemove);
        }
      }
    }
  }

  @SubscribeMessage("join_board")
  handleJoinBoard(
    @MessageBody() data: JoinBoardEvent,
    @ConnectedSocket() client: Socket,
  ): void {
    this.userSockets.set(data.userId, client.id);

    if (!this.boardUsers.has(data.boardId)) {
      this.boardUsers.set(data.boardId, new Set());
    }

    this.boardUsers.get(data.boardId)?.add(data.userId);
    client.join(data.boardId);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    void this.emitUserJoinedBoard(data.boardId, data.userId, data.username);
  }

  @SubscribeMessage("leave_board")
  handleLeaveBoard(
    @MessageBody() data: JoinBoardEvent,
    @ConnectedSocket() client: Socket,
  ): void {
    this.userSockets.delete(data.userId);
    client.leave(data.boardId);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    void this.emitUserLeftBoard(data.boardId, data.userId);
  }

  emitTicketCreated(ticket: { boardId: string }) {
    this.server.to(ticket.boardId).emit(WebSocketEvents.TICKET_CREATED, {
      event: WebSocketEvents.TICKET_CREATED,
      ticket,
      timestamp: new Date(),
    });
  }

  emitTicketUpdated(ticket: { boardId: string }) {
    this.server.to(ticket.boardId).emit(WebSocketEvents.TICKET_UPDATED, {
      event: WebSocketEvents.TICKET_UPDATED,
      ticket,
      timestamp: new Date(),
    });
  }

  emitTicketDeleted(ticketId: string, boardId: string) {
    this.server.to(boardId).emit(WebSocketEvents.TICKET_DELETED, {
      event: WebSocketEvents.TICKET_DELETED,
      ticketId,
      boardId,
      timestamp: new Date(),
    });
  }

  emitTicketMoved(data: TicketMovedEvent) {
    this.server.to(data.boardId).emit(WebSocketEvents.TICKET_MOVED, {
      event: WebSocketEvents.TICKET_MOVED,
      ticket: data.ticket,
      oldColumnId: data.oldColumnId,
      newColumnId: data.newColumnId,
      boardId: data.boardId,
      timestamp: new Date(),
    });
  }

  emitUserJoinedBoard(boardId: string, userId: string, username: string) {
    this.server.to(boardId).emit(WebSocketEvents.USER_JOINED_BOARD, {
      event: WebSocketEvents.USER_JOINED_BOARD,
      userId,
      username,
      boardId,
      timestamp: new Date(),
    });
  }

  emitUserLeftBoard(boardId: string, userId: string) {
    this.server.to(boardId).emit(WebSocketEvents.USER_LEFT_BOARD, {
      event: WebSocketEvents.USER_LEFT_BOARD,
      userId,
      boardId,
      timestamp: new Date(),
    });
  }
}
