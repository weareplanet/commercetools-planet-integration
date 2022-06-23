module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.ts',
    '!**/*spec.ts',
    '!**/*specs.ts',
    '!app/domain/services/configs/*.config.ts'
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
      branches: 55,
      functions: 75,
      lines: 75,
      statements: 70
    }
  }
};
