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

  handleConnection(client: Socket) {
    console.log('WebSocket client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('WebSocket client disconnected:', client.id);
    let userIdToRemove: string | undefined;

    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        userIdToRemove = userId;
        break;
      }
    }

    if (userIdToRemove) {
      console.log('Removing user from socket mapping:', userIdToRemove);
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
    console.log('User joining board:', data);
    this.userSockets.set(data.userId, client.id);

    if (!this.boardUsers.has(data.boardId)) {
      this.boardUsers.set(data.boardId, new Set());
    }

    this.boardUsers.get(data.boardId)?.add(data.userId);
    client.join(data.boardId);
    console.log('User joined board room:', data.boardId, 'Users in board:', this.boardUsers.get(data.boardId)?.size);

    void this.emitUserJoinedBoard(data.boardId, data.userId, data.username);
  }

  @SubscribeMessage("leave_board")
  handleLeaveBoard(
    @MessageBody() data: JoinBoardEvent,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log('User leaving board:', data);
    this.userSockets.delete(data.userId);
    client.leave(data.boardId);

    void this.emitUserLeftBoard(data.boardId, data.userId);
  }

  emitTicketCreated(ticket: { boardId: string }) {
    console.log('Emitting ticket created event for board:', ticket.boardId);
    this.server.to(ticket.boardId).emit(WebSocketEvents.TICKET_CREATED, {
      ticket,
      boardId: ticket.boardId,
    });
  }

  emitTicketUpdated(ticket: { boardId: string }) {
    console.log('Emitting ticket updated event for board:', ticket.boardId);
    this.server.to(ticket.boardId).emit(WebSocketEvents.TICKET_UPDATED, {
      ticket,
      boardId: ticket.boardId,
    });
  }

  emitTicketDeleted(ticketId: string, boardId: string) {
    this.server.to(boardId).emit(WebSocketEvents.TICKET_DELETED, {
      ticketId,
      boardId,
    });
  }

  emitTicketMoved(data: TicketMovedEvent) {
    this.server.to(data.boardId).emit(WebSocketEvents.TICKET_MOVED, {
      ticket: data.ticket,
      oldColumnId: data.oldColumnId,
      newColumnId: data.newColumnId,
      boardId: data.boardId,
    });
  }

  emitUserJoinedBoard(boardId: string, userId: string, username: string) {
    this.server.to(boardId).emit(WebSocketEvents.USER_JOINED_BOARD, {
      userId,
      username,
      boardId,
    });
  }

  emitUserLeftBoard(boardId: string, userId: string) {
    this.server.to(boardId).emit(WebSocketEvents.USER_LEFT_BOARD, {
      userId,
      boardId,
    });
  }
}
