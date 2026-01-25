// export default {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   setupFiles: ['dotenv/config'], // loads .env (dotenv will respect dotenv-cli if used)
//   testMatch: ['**/tests/**/*.test.ts'],
//   setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
//   testTimeout: 30000,
// };
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};

export default config;