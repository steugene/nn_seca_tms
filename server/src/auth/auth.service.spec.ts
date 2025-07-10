import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { createMockUser } from '../../test/helpers/test-utils';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockBcrypt = require('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = createMockUser();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashedpassword');
      usersService.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      configService.get.mockReturnValue('test-secret');

      const result = await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashedpassword',
      });
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          avatar: mockUser.avatar,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      try {
        await service.register(registerDto);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('User with this email already exists');
      }
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      configService.get.mockReturnValue('test-secret');

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          avatar: mockUser.avatar,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      try {
        await service.login(loginDto);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid credentials');
      }
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      try {
        await service.login(loginDto);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid credentials');
      }
    });
  });

  describe('refreshToken', () => {
    const refreshToken = 'valid-refresh-token';

    it('should refresh token successfully', async () => {
      const payload = { sub: mockUser.id, username: mockUser.username };
      jwtService.verify.mockReturnValue(payload);
      usersService.findById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('new-access-token');
      configService.get.mockReturnValue('test-secret');

      const result = await service.refreshToken(refreshToken);

      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-secret',
      });
      expect(usersService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        accessToken: 'new-access-token',
      });
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      try {
        await service.refreshToken(refreshToken);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid refresh token');
      }
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const payload = { sub: mockUser.id, username: mockUser.username };
      jwtService.verify.mockReturnValue(payload);
      usersService.findById.mockResolvedValue(null);

      try {
        await service.refreshToken(refreshToken);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid refresh token');
      }
    });
  });
}); 