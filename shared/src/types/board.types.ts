export interface Board {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  columns: Column[];
  tickets?: Ticket[];
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  tickets: Ticket[];
}

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  createdBy: string;
  columnId: string;
  boardId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  assignedUser?: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdByUser?: {
    id: string;
    username: string;
    avatar?: string;
  };
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TicketStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  TESTING = 'TESTING',
  DONE = 'DONE'
}

export interface CreateBoardDto {
  title: string;
  description?: string;
}

export interface UpdateBoardDto {
  title?: string;
  description?: string;
}

export interface CreateTicketDto {
  title: string;
  description?: string;
  priority: TicketPriority;
  assignedTo?: string;
  columnId: string;
  boardId: string;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  assignedTo?: string;
  columnId?: string;
  order?: number;
}

export interface MoveTicketDto {
  ticketId: string;
  columnId: string;
  order: number;
} 