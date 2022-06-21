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
    '<rootDir>/test/setup/global-hooks.ts'
  ],
  silent: true,
  coverageThreshold: {
    global: {
      branches: 53,
      functions: 63,
      lines: 63,
      statements: 63
    }
  }
};
