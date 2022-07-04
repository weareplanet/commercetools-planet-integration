module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.ts',
    '!**/*spec.ts',
    '!**/*specs.ts',
    '!app/interfaces/*.ts',
    '!app/domain/environment-agnostic-handlers/**/index.ts'
  ],
  coverageReporters: [
    'json', 'html', 'text'
  ],
  rootDir: '.',
  setupFilesAfterEnv: [
    '<rootDir>/test/setup/global-hooks.ts',
    '<rootDir>/test/setup/load-global-mocks.ts'
  ],
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/app/$1',
    '@domain/(.*)': '<rootDir>/app/domain/$1',
    '@environment-specific-handlers/(.*)': 'app/environment-specific-handlers/$1'
  },
  silent: true,
  coverageThreshold: {
    global: {
      branches: 53,
      functions: 77,
      lines: 73,
      statements: 70
    }
  }
};
