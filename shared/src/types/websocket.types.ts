import { Ticket, Board } from './board.types';

export enum WebSocketEvents {
  TICKET_CREATED = 'ticket_created',
  TICKET_UPDATED = 'ticket_updated',
  TICKET_DELETED = 'ticket_deleted',
  TICKET_MOVED = 'ticket_moved',
  BOARD_CREATED = 'board_created',
  BOARD_UPDATED = 'board_updated',
  BOARD_DELETED = 'board_deleted',
  USER_JOINED_BOARD = 'user_joined_board',
  USER_LEFT_BOARD = 'user_left_board',
  JOIN_BOARD = 'join_board',
  LEAVE_BOARD = 'leave_board'
}

export interface WebSocketMessage<T = unknown> {
  event: WebSocketEvents;
  data: T;
  boardId?: string;
  userId?: string;
  timestamp: Date;
}

export interface TicketCreatedEvent {
  ticket: Ticket;
  boardId: string;
}

export interface TicketUpdatedEvent {
  ticket: Ticket;
  boardId: string;
}

export interface TicketDeletedEvent {
  ticketId: string;
  boardId: string;
}

export interface TicketMovedEvent {
  ticket: Ticket;
  oldColumnId: string;
  newColumnId: string;
  boardId: string;
}

export interface BoardCreatedEvent {
  board: Board;
}

export interface BoardUpdatedEvent {
  board: Board;
}

export interface BoardDeletedEvent {
  boardId: string;
}

export interface UserJoinedBoardEvent {
  userId: string;
  username: string;
  boardId: string;
}

export interface UserLeftBoardEvent {
  userId: string;
  username: string;
  boardId: string;
}

export interface JoinBoardEvent {
  boardId: string;
}

export interface LeaveBoardEvent {
  boardId: string;
} 