import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from '../entities/ticket.entity';
import { Column } from '../entities/column.entity';
import { createMockTicket, createMockColumn } from '../../test/helpers/test-utils';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { MoveTicketDto } from './dto/move-ticket.dto';
import { TicketStatus, TicketPriority } from '@nn-seca-tms/shared';

describe('TicketsService', () => {
  let service: TicketsService;
  let ticketsRepository: jest.Mocked<Repository<Ticket>>;
  let columnsRepository: jest.Mocked<Repository<Column>>;

  const mockTicket = createMockTicket();
  const mockColumn = createMockColumn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
            manager: {
              connection: {
                queryResultCache: {
                  remove: jest.fn(),
                },
              },
            },
          },
        },
        {
          provide: getRepositoryToken(Column),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    ticketsRepository = module.get(getRepositoryToken(Ticket));
    columnsRepository = module.get(getRepositoryToken(Column));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new ticket', async () => {
      const createTicketDto: CreateTicketDto = {
        title: 'Test Ticket',
        description: 'Test Description',
        columnId: 'column-id',
        boardId: 'board-id',
        priority: TicketPriority.MEDIUM,
        assignedTo: 'user-id',
      };
      const userId = 'creator-id';

      columnsRepository.findOne.mockResolvedValue(mockColumn);
      ticketsRepository.count.mockResolvedValue(0);
      ticketsRepository.create.mockReturnValue(mockTicket);
      ticketsRepository.save.mockResolvedValue(mockTicket);
      ticketsRepository.findOne.mockResolvedValue(mockTicket);

      const result = await service.create(createTicketDto, userId);

      expect(columnsRepository.findOne).toHaveBeenCalledWith({
        where: { id: createTicketDto.columnId },
      });
      expect(ticketsRepository.count).toHaveBeenCalledWith({
        where: { columnId: createTicketDto.columnId },
      });
      expect(ticketsRepository.create).toHaveBeenCalledWith({
        ...createTicketDto,
        createdBy: userId,
        order: 0,
        status: TicketStatus.TODO,
      });
      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException if column not found', async () => {
      columnsRepository.findOne.mockResolvedValue(null);

      try {
        await service.create({ columnId: 'nonexistent' } as CreateTicketDto, 'user-id');
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Column with ID nonexistent not found');
      }
    });
  });

  describe('findAll', () => {
    it('should return all tickets with relations', async () => {
      const tickets = [mockTicket, createMockTicket({ id: 'ticket2' })];
      ticketsRepository.find.mockResolvedValue(tickets);

      const result = await service.findAll();

      expect(ticketsRepository.find).toHaveBeenCalledWith({
        relations: ['assignedUser', 'createdByUser', 'column', 'board'],
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toEqual(tickets);
    });
  });

  describe('findOne', () => {
    it('should return a ticket by id', async () => {
      ticketsRepository.findOne.mockResolvedValue(mockTicket);

      const result = await service.findOne(mockTicket.id);

      expect(ticketsRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTicket.id },
        relations: ['assignedUser', 'createdByUser', 'column', 'board'],
      });
      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException if ticket not found', async () => {
      ticketsRepository.findOne.mockResolvedValue(null);

      try {
        await service.findOne('nonexistent-id');
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Ticket with ID nonexistent-id not found');
      }
    });
  });

  describe('update', () => {
    it('should update a ticket', async () => {
      const updateTicketDto: UpdateTicketDto = {
        title: 'Updated Ticket',
        description: 'Updated Description',
      };
      const userId = 'user-id';
      const updatedTicket = { ...mockTicket, ...updateTicketDto };

      ticketsRepository.findOne.mockResolvedValueOnce(mockTicket);
      ticketsRepository.save.mockResolvedValue(updatedTicket);
      ticketsRepository.findOne.mockResolvedValueOnce(updatedTicket);

      const result = await service.update(mockTicket.id, updateTicketDto, userId);

      expect(ticketsRepository.save).toHaveBeenCalledWith({
        ...mockTicket,
        ...updateTicketDto,
      });
      expect(result).toEqual(updatedTicket);
    });

    it('should throw NotFoundException if ticket not found', async () => {
      ticketsRepository.findOne.mockResolvedValue(null);

      try {
        await service.update('nonexistent-id', {}, 'user-id');
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Ticket with ID nonexistent-id not found');
      }
    });
  });

  describe('remove', () => {
    it('should remove a ticket', async () => {
      ticketsRepository.findOne.mockResolvedValue(mockTicket);
      ticketsRepository.remove.mockResolvedValue(mockTicket);

      await service.remove(mockTicket.id, 'user-id');

      expect(ticketsRepository.remove).toHaveBeenCalledWith(mockTicket);
    });

    it('should throw NotFoundException if ticket not found', async () => {
      ticketsRepository.findOne.mockResolvedValue(null);

      try {
        await service.remove('nonexistent-id', 'user-id');
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Ticket with ID nonexistent-id not found');
      }
    });
  });

  describe('move', () => {
    it('should move a ticket to another column', async () => {
      const moveTicketDto: MoveTicketDto = {
        ticketId: mockTicket.id,
        columnId: 'new-column-id',
        order: 1,
      };
      const userId = 'user-id';

      ticketsRepository.findOne.mockResolvedValueOnce(mockTicket);
      columnsRepository.findOne.mockResolvedValue(mockColumn);
      ticketsRepository.findOne.mockResolvedValueOnce(mockTicket);

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn(),
      };

      ticketsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.move(moveTicketDto, userId);

      expect(columnsRepository.findOne).toHaveBeenCalledWith({
        where: { id: moveTicketDto.columnId },
      });
      expect(ticketsRepository.createQueryBuilder).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException if ticket not found', async () => {
      ticketsRepository.findOne.mockResolvedValue(null);

      try {
        await service.move({ ticketId: 'nonexistent' } as MoveTicketDto, 'user-id');
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Ticket with ID nonexistent not found');
      }
    });
  });

  describe('findByBoard', () => {
    it('should return tickets for a specific board', async () => {
      const tickets = [mockTicket];
      ticketsRepository.find.mockResolvedValue(tickets);

      const result = await service.findByBoard('board-id');

      expect(ticketsRepository.find).toHaveBeenCalledWith({
        where: { boardId: 'board-id' },
        relations: ['assignedUser', 'createdByUser', 'column'],
        order: {
          order: 'ASC',
        },
      });
      expect(result).toEqual(tickets);
    });
  });

  describe('findByUser', () => {
    it('should return tickets for a specific user', async () => {
      const tickets = [mockTicket];
      ticketsRepository.find.mockResolvedValue(tickets);

      const result = await service.findByUser('user-id');

      expect(ticketsRepository.find).toHaveBeenCalledWith({
        where: [{ assignedTo: 'user-id' }, { createdBy: 'user-id' }],
        relations: ['assignedUser', 'createdByUser', 'column', 'board'],
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toEqual(tickets);
    });
  });

  describe('getStatusFromColumnTitle', () => {
    it('should return correct status for column titles', () => {
      expect(service['getStatusFromColumnTitle']('To Do')).toBe(TicketStatus.TODO);
      expect(service['getStatusFromColumnTitle']('In Progress')).toBe(TicketStatus.IN_PROGRESS);
      expect(service['getStatusFromColumnTitle']('Testing')).toBe(TicketStatus.TESTING);
      expect(service['getStatusFromColumnTitle']('Done')).toBe(TicketStatus.DONE);
      expect(service['getStatusFromColumnTitle']('Unknown')).toBe(TicketStatus.TODO);
    });
  });
}); 