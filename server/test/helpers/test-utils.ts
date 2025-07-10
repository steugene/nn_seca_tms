import { DataSource } from 'typeorm';
import { User } from '../../src/entities/user.entity';
import { Board } from '../../src/entities/board.entity';
import { Column } from '../../src/entities/column.entity';
import { Ticket } from '../../src/entities/ticket.entity';
import { TicketPriority, TicketStatus } from '@nn-seca-tms/shared';
import * as bcrypt from 'bcryptjs';

export const createTestDataSource = async (): Promise<DataSource> => {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'nn_seca_tms_test',
    entities: [User, Board, Column, Ticket],
    synchronize: true,
    logging: false,
    dropSchema: true,
  });

  await dataSource.initialize();
  return dataSource;
};

export const createTestUser = async (dataSource: DataSource, overrides?: Partial<User>): Promise<User> => {
  const userRepository = dataSource.getRepository(User);
  const userData = {
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    password: await bcrypt.hash('password123', 10),
    ...overrides,
  };

  const user = userRepository.create(userData);
  return userRepository.save(user);
};

export const createTestBoard = async (
  dataSource: DataSource,
  createdBy: string,
  overrides?: Partial<Board>
): Promise<Board> => {
  const boardRepository = dataSource.getRepository(Board);
  const boardData = {
    title: 'Test Board',
    description: 'Test Description',
    createdBy,
    ...overrides,
  };

  const board = boardRepository.create(boardData);
  return boardRepository.save(board);
};

export const createTestColumn = async (
  dataSource: DataSource,
  boardId: string,
  overrides?: Partial<Column>
): Promise<Column> => {
  const columnRepository = dataSource.getRepository(Column);
  const columnData = {
    title: 'To Do',
    boardId,
    order: 0,
    ...overrides,
  };

  const column = columnRepository.create(columnData);
  return columnRepository.save(column);
};

export const createTestTicket = async (
  dataSource: DataSource,
  data: {
    boardId: string;
    columnId: string;
    createdBy: string;
    assignedTo?: string;
  },
  overrides?: Partial<Ticket>
): Promise<Ticket> => {
  const ticketRepository = dataSource.getRepository(Ticket);
  const ticketData = {
    title: 'Test Ticket',
    description: 'Test Description',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.TODO,
    order: 0,
    ...data,
    ...overrides,
  };

  const ticket = ticketRepository.create(ticketData);
  return ticketRepository.save(ticket);
};

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  password: 'hashedpassword',
  avatar: undefined,
  boards: [],
  createdTickets: [],
  assignedTickets: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockBoard = (overrides?: Partial<Board>): Board => ({
  id: '550e8400-e29b-41d4-a716-446655440001',
  title: 'Test Board',
  description: 'Test Description',
  createdBy: '550e8400-e29b-41d4-a716-446655440000',
  createdByUser: createMockUser(),
  columns: [],
  tickets: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockColumn = (overrides?: Partial<Column>): Column => ({
  id: '550e8400-e29b-41d4-a716-446655440002',
  title: 'To Do',
  boardId: '550e8400-e29b-41d4-a716-446655440001',
  order: 0,
  board: createMockBoard(),
  tickets: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockTicket = (overrides?: Partial<Ticket>): Ticket => ({
  id: '550e8400-e29b-41d4-a716-446655440003',
  title: 'Test Ticket',
  description: 'Test Description',
  priority: TicketPriority.MEDIUM,
  status: TicketStatus.TODO,
  assignedTo: undefined,
  createdBy: '550e8400-e29b-41d4-a716-446655440000',
  columnId: '550e8400-e29b-41d4-a716-446655440002',
  boardId: '550e8400-e29b-41d4-a716-446655440001',
  order: 0,
  assignedUser: undefined,
  createdByUser: createMockUser(),
  column: createMockColumn(),
  board: createMockBoard(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const cleanupDatabase = async (dataSource: DataSource): Promise<void> => {
  const entities = [Ticket, Column, Board, User];
  for (const entity of entities) {
    const repository = dataSource.getRepository(entity);
    await repository.clear();
  }
}; 