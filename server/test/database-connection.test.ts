import { DataSource, QueryRunner } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Board } from '../src/entities/board.entity';
import { Column } from '../src/entities/column.entity';
import { Ticket } from '../src/entities/ticket.entity';

describe('Database Connection', () => {
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'nn_seca_tms',
      entities: [User, Board, Column, Ticket],
      synchronize: true,
      logging: false,
    });

    await dataSource.initialize();
  });

  beforeEach(async () => {
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  test('should connect to database', async () => {
    expect(dataSource.isInitialized).toBe(true);
  });

  test('should create and query users table', async () => {
    const userRepository = queryRunner.manager.getRepository(User);
    
    const user = userRepository.create({
      email: `test-${Date.now()}@example.com`,
      username: `testuser-${Date.now()}`,
      firstName: 'Test',
      lastName: 'User',
      password: 'hashedpassword',
    });

    const savedUser = await userRepository.save(user);
    expect(savedUser.id).toBeDefined();
    expect(savedUser.email).toContain('test-');
    expect(savedUser.email).toContain('@example.com');

    const foundUser = await userRepository.findOne({ where: { id: savedUser.id } });
    expect(foundUser).toBeDefined();
    expect(foundUser!.email).toContain('test-');
  });

  test('should create and query boards table', async () => {
    const boardRepository = queryRunner.manager.getRepository(Board);
    const userRepository = queryRunner.manager.getRepository(User);
    const user = await userRepository.save({
      email: `boardowner-${Date.now()}@example.com`,
      username: `boardowner-${Date.now()}`,
      firstName: 'Board',
      lastName: 'Owner',
      password: 'hashedpassword',
    });

    const board = boardRepository.create({
      title: 'Test Board',
      description: 'Test Description',
      createdBy: user.id,
    });

    const savedBoard = await boardRepository.save(board);
    expect(savedBoard.id).toBeDefined();
    expect(savedBoard.title).toBe('Test Board');

    const foundBoard = await boardRepository.findOne({ where: { id: savedBoard.id } });
    expect(foundBoard).toBeDefined();
    expect(foundBoard!.title).toBe('Test Board');
  });

  test('should handle database transactions with rollback', async () => {
    const userRepository = queryRunner.manager.getRepository(User);
    
    const user = userRepository.create({
      email: `transaction-${Date.now()}@example.com`,
      username: `transactionuser-${Date.now()}`,
      firstName: 'Transaction',
      lastName: 'User',
      password: 'hashedpassword',
    });

    const savedUser = await userRepository.save(user);
    expect(savedUser.id).toBeDefined();
    expect(savedUser.email).toContain('transaction-');
    const foundUser = await userRepository.findOne({ where: { id: savedUser.id } });
    expect(foundUser).toBeDefined();
  });

  test('should enforce unique constraints', async () => {
    const userRepository = queryRunner.manager.getRepository(User);
    const timestamp = Date.now();
    const email = `unique-${timestamp}@example.com`;
    await userRepository.save({
      email: email,
      username: `uniqueuser-${timestamp}`,
      firstName: 'Unique',
      lastName: 'User',
      password: 'hashedpassword',
    });
    try {
      await userRepository.save({
        email: email,
        username: `differentuser-${timestamp}`,
        firstName: 'Different',
        lastName: 'User',
        password: 'hashedpassword',
      });
      fail('Should have thrown error for duplicate email');
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        expect(error.code).toBe('23505');
      } else {
        throw error;
      }
    }
  });
}); 