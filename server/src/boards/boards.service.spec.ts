import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from '../entities/board.entity';
import { Column } from '../entities/column.entity';
import { createMockBoard, createMockColumn } from '../../test/helpers/test-utils';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

describe('BoardsService', () => {
  let service: BoardsService;
  let boardsRepository: jest.Mocked<Repository<Board>>;
  let columnsRepository: jest.Mocked<Repository<Column>>;

  const mockBoard = createMockBoard();
  const mockColumn = createMockColumn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: getRepositoryToken(Board),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Column),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
    boardsRepository = module.get(getRepositoryToken(Board));
    columnsRepository = module.get(getRepositoryToken(Column));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new board with default columns', async () => {
      const createBoardDto: CreateBoardDto = {
        title: 'Test Board',
        description: 'Test Description',
      };
      const userId = 'user-id';

      boardsRepository.create.mockReturnValue(mockBoard);
      boardsRepository.save.mockResolvedValue(mockBoard);
      columnsRepository.create.mockReturnValue(mockColumn);
      columnsRepository.save.mockResolvedValue(mockColumn);
      boardsRepository.findOne.mockResolvedValue(mockBoard);

      const result = await service.create(createBoardDto, userId);

      expect(boardsRepository.create).toHaveBeenCalledWith({
        ...createBoardDto,
        createdBy: userId,
      });
      expect(boardsRepository.save).toHaveBeenCalledWith(mockBoard);
      expect(columnsRepository.create).toHaveBeenCalledTimes(4);
      expect(columnsRepository.save).toHaveBeenCalledTimes(4);
      expect(result).toEqual(mockBoard);
    });
  });

  describe('findAll', () => {
    it('should return all boards with relations', async () => {
      const boards = [mockBoard, createMockBoard({ id: 'board2' })];
      boardsRepository.find.mockResolvedValue(boards);

      const result = await service.findAll();

      expect(boardsRepository.find).toHaveBeenCalledWith({
        relations: ['columns', 'createdByUser', 'tickets'],
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toEqual(boards);
    });
  });

  describe('findOne', () => {
    it('should return a board by id', async () => {
      boardsRepository.findOne.mockResolvedValue(mockBoard);

      const result = await service.findOne(mockBoard.id);

      expect(boardsRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockBoard.id },
        relations: ['columns', 'createdByUser', 'tickets'],
        order: {
          columns: {
            order: 'ASC',
          },
        },
      });
      expect(result).toEqual(mockBoard);
    });

    it('should throw NotFoundException if board not found', async () => {
      boardsRepository.findOne.mockResolvedValue(null);

      try {
        await service.findOne('nonexistent-id');
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Board with ID nonexistent-id not found');
      }
    });
  });

  describe('update', () => {
    it('should update a board', async () => {
      const updateBoardDto: UpdateBoardDto = {
        title: 'Updated Board',
        description: 'Updated Description',
      };
      const userId = 'user-id';
      const updatedBoard = { ...mockBoard, ...updateBoardDto };

      boardsRepository.findOne.mockResolvedValueOnce(mockBoard);
      boardsRepository.update.mockResolvedValue(undefined);
      boardsRepository.findOne.mockResolvedValueOnce(updatedBoard);

      const result = await service.update(mockBoard.id, updateBoardDto, userId);

      expect(boardsRepository.update).toHaveBeenCalledWith(mockBoard.id, updateBoardDto);
      expect(result).toEqual(updatedBoard);
    });

    it('should throw NotFoundException if board not found', async () => {
      boardsRepository.findOne.mockResolvedValue(null);

      try {
        await service.update('nonexistent-id', {}, 'user-id');
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Board with ID nonexistent-id not found');
      }
    });
  });

  describe('remove', () => {
    it('should remove a board', async () => {
      boardsRepository.findOne.mockResolvedValue(mockBoard);
      boardsRepository.remove.mockResolvedValue(mockBoard);

      await service.remove(mockBoard.id, 'user-id');

      expect(boardsRepository.remove).toHaveBeenCalledWith(mockBoard);
    });

    it('should throw NotFoundException if board not found', async () => {
      boardsRepository.findOne.mockResolvedValue(null);

      try {
        await service.remove('nonexistent-id', 'user-id');
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Board with ID nonexistent-id not found');
      }
    });
  });
}); 