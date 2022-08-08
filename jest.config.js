module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  testPathIgnorePatterns: [
    '<rootDir>/dist/'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.ts',
    '!**/*spec.ts',
    '!**/*specs.ts',
    '!app/interfaces/*.ts'
  ],
  coverageReporters: [
    'json', 'html', 'text'
  ],
  rootDir: '.',
  setupFilesAfterEnv: [
    '<rootDir>/test/setup/global-hooks.ts',
    '<rootDir>/test/setup/load-global-mocks.ts'
  ],
  silent: true,
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 65,
      functions: 80,
      lines: 85
    }
  }
};
