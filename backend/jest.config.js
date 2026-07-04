/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/swagger.ts',
    '!src/db/seed.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 45,
      lines: 55,
      statements: 55,
    },
  },
  maxWorkers: 1,
};
