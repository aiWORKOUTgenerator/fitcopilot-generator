module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/jest/__mocks__/styleMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/jest/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testMatch: ['**/tests/jest/**/*.test.ts', '**/tests/jest/**/*.test.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
  ],
}; 