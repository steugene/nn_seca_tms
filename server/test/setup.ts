import { config } from 'dotenv';

config({ path: '.env.test' });

process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'nn_seca_tms_test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

afterEach(() => {
  jest.clearAllMocks();
}); 