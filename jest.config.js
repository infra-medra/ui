/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'mts', 'html', 'js', 'json', 'mjs'],
  roots: ['<rootDir>/projects', '<rootDir>/tests'],
  testMatch: ['<rootDir>/projects/**/*.spec.ts', '<rootDir>/tests/**/*.test.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  moduleNameMapper: {
    '^@medra.dev/ui$': '<rootDir>/projects/medra/ui/src/public-api.ts',
    '^@medra.dev/ui/router$': '<rootDir>/projects/medra/ui/router/src/public-api.ts',
  },
  transform: {
    '^.+\\.(ts|mts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/projects/medra/ui/tsconfig.jest.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
};
