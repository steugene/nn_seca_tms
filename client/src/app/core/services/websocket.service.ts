import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { Observable, BehaviorSubject } from "rxjs";
import {
  TicketCreatedEvent,
  TicketUpdatedEvent,
  TicketDeletedEvent,
  TicketMovedEvent,
  UserJoinedBoardEvent,
  UserLeftBoardEvent,
  WebSocketEvents,
} from "@nn-seca-tms/shared";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  private socket!: Socket;
  private connectedSubject = new BehaviorSubject<boolean>(false);

  public connected$ = this.connectedSubject.asObservable();

  public onTicketCreated$!: Observable<TicketCreatedEvent>;
  public onTicketUpdated$!: Observable<TicketUpdatedEvent>;
  public onTicketDeleted$!: Observable<TicketDeletedEvent>;
  public onTicketMoved$!: Observable<TicketMovedEvent>;

  public onUserJoinedBoard$!: Observable<UserJoinedBoardEvent>;
  public onUserLeftBoard$!: Observable<UserLeftBoardEvent>;

  constructor(private authService: AuthService) {
    this.initializeSocket();
    this.setupEventListeners();
  }

  private initializeSocket(): void {
    const token = this.authService.getToken();
    this.socket = io("ws://localhost:3000", {
      auth: { token },
      transports: ["websocket"],
      autoConnect: false,
    });

    this.socket.on("connect", () => {
      this.connectedSubject.next(true);
    });

    this.socket.on("disconnect", () => {
      this.connectedSubject.next(false);
    });

    this.socket.on("connect_error", (_error: Error) => {
      this.connectedSubject.next(false);
    });
  }

  private setupEventListeners(): void {
    this.onTicketCreated$ = new Observable<TicketCreatedEvent>((observer) => {
      this.socket.on(
        WebSocketEvents.TICKET_CREATED,
        (message: TicketCreatedEvent) => {
          observer.next(message);
        },
      );
    });

    this.onTicketUpdated$ = new Observable<TicketUpdatedEvent>((observer) => {
      this.socket.on(
        WebSocketEvents.TICKET_UPDATED,
        (message: TicketUpdatedEvent) => {
          observer.next(message);
        },
      );
    });

    this.onTicketDeleted$ = new Observable<TicketDeletedEvent>((observer) => {
      this.socket.on(
        WebSocketEvents.TICKET_DELETED,
        (message: TicketDeletedEvent) => {
          observer.next(message);
        },
      );
    });

    this.onTicketMoved$ = new Observable<TicketMovedEvent>((observer) => {
      this.socket.on(
        WebSocketEvents.TICKET_MOVED,
        (message: TicketMovedEvent) => {
          observer.next(message);
        },
      );
    });

    this.onUserJoinedBoard$ = new Observable<UserJoinedBoardEvent>(
      (observer) => {
        this.socket.on(
          WebSocketEvents.USER_JOINED_BOARD,
          (message: UserJoinedBoardEvent) => {
            observer.next(message);
          },
        );
      },
    );

    this.onUserLeftBoard$ = new Observable<UserLeftBoardEvent>((observer) => {
      this.socket.on(
        WebSocketEvents.USER_LEFT_BOARD,
        (message: UserLeftBoardEvent) => {
          observer.next(message);
        },
      );
    });
  }

  public connect(): void {
    const token = this.authService.getToken();
    console.log('WebSocket connect called, token exists:', !!token, 'already connected:', this.socket?.connected);
    if (token && !this.socket.connected) {
      this.socket.auth = { token };
      this.socket.connect();
    }
  }

  public disconnect(): void {
    console.log('WebSocket disconnect called');
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }

  public reconnect(): void {
    console.log('WebSocket reconnect called');
    this.disconnect();
    this.connect();
  }

  public isConnected(): boolean {
    const connected = this.socket?.connected || false;
    console.log('WebSocket isConnected check:', connected);
    return connected;
  }

  joinBoard(boardId: string): void {
    const currentUser = this.authService.currentUser;
    console.log('Joining board:', boardId, 'user:', currentUser?.username, 'socket connected:', this.socket?.connected);
    if (this.socket && this.socket.connected && currentUser) {
      this.socket.emit(WebSocketEvents.JOIN_BOARD, { 
        boardId,
        userId: currentUser.id,
        username: currentUser.username
      });
      console.log('Emitted JOIN_BOARD event');
    } else {
      console.log('Cannot join board - socket:', !!this.socket, 'connected:', this.socket?.connected, 'user:', !!currentUser);
    }
  }

  leaveBoard(boardId: string): void {
    const currentUser = this.authService.currentUser;
    console.log('Leaving board:', boardId, 'user:', currentUser?.username);
    if (this.socket && this.socket.connected && currentUser) {
      this.socket.emit(WebSocketEvents.LEAVE_BOARD, { 
        boardId,
        userId: currentUser.id,
        username: currentUser.username
      });
      console.log('Emitted LEAVE_BOARD event');
    }
  }
}
