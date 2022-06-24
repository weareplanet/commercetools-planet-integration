module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.ts',
    '!**/*spec.ts',
    '!**/*specs.ts',
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
      branches: 60,
      functions: 80,
      lines: 75,
      statements: 75
    }
  }
};
