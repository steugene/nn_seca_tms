import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { createMockUser } from '../../test/helpers/test-utils';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser = createMockUser();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedpassword',
      };

      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users without password', async () => {
      const users = [mockUser, createMockUser({ id: 'user2', email: 'user2@example.com' })];
      repository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        select: [
          'id',
          'email',
          'username',
          'firstName',
          'lastName',
          'avatar',
          'createdAt',
          'updatedAt',
        ],
      });
      expect(result).toEqual(users);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: [
          'id',
          'email',
          'username',
          'firstName',
          'lastName',
          'avatar',
          'createdAt',
          'updatedAt',
        ],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      try {
        await service.findById('nonexistent-id');
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User with ID nonexistent-id not found');
      }
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername(mockUser.username);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { username: mockUser.username },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent-username');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateData = { firstName: 'Updated', lastName: 'Name' };
      const updatedUser = { ...mockUser, ...updateData };

      repository.findOne.mockResolvedValue(mockUser);
      repository.save.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateData);

      expect(repository.save).toHaveBeenCalledWith({ ...mockUser, ...updateData });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      try {
        await service.update('nonexistent-id', { firstName: 'Updated' });
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User with ID nonexistent-id not found');
      }
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      repository.remove.mockResolvedValue(mockUser);

      await service.remove(mockUser.id);

      expect(repository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      try {
        await service.remove('nonexistent-id');
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User with ID nonexistent-id not found');
      }
    });
  });
}); 